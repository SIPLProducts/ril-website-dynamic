# Nginx: port 443 only, IP-only, /admin inside the organization only

## What changes in the deploy folder
1. **New `deploy/nginx/ril.conf`** (replaces the old one)
   - Only port 443. No port 80 block, no domain name.
   - Answers on `38.31.132.10` (public) and `10.200.1.8` (private).
   - Self-signed certificate for both IPs (Certbot needs a domain, so it is removed).
   - **/admin is blocked from the internet**: allowed only from the office network (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 by default — editable list at the top of the file). Public visitors get "403 Forbidden".
   - Website pages -> app on port 3000; database/login/file calls -> backend on port 8000 (port 8000 and Studio never exposed).
   - No IPv6 lines.
2. **`deploy/nginx/make-selfsigned-cert.sh`** — one command creates the certificate.
3. **`deploy/backend/supabase/run-migrations.sh`** — loads all tables, file storage and Super Admin SQL into the database container in one go; safe to re-run.
4. **`.env.example` + README** updated: `VITE_SUPABASE_URL=https://38.31.132.10`, exact command order.

## Important note on /admin
Office staff must open the admin via the private address `https://10.200.1.8/admin`. Admin pages call login/database through the same address, so it works fully inside the office. If your office reaches the internet through 38.31.132.10 itself (hairpin NAT), the server sees the real office IP only when traffic stays internal — using 10.200.1.8 avoids that problem.

## Technical details
- `map $remote_addr $ril_internal` / `allow 10.0.0.0/8; ... deny all;` inside `location ^~ /admin` (also the admin server-function path `/_serverFn` stays open because the public careers form uses it; admin functions are already protected by login + roles).
- Backend locations `^/(rest|auth|storage|realtime)/v1/` with websocket headers, `client_max_body_size 50M`.
- Cert: `openssl req -x509 -nodes -days 825 -newkey rsa:2048 -subj "/CN=38.31.132.10" -addext "subjectAltName=IP:38.31.132.10,IP:10.200.1.8"`.
- Migrations: `docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < sql/0X_*.sql`.
- Backend `.env`: `SITE_URL`, `API_EXTERNAL_URL`, `SUPABASE_PUBLIC_URL` = `https://38.31.132.10`, then `docker compose up -d`.
