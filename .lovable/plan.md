# Public-IP HTTPS setup (no domain) + one-command table setup

## What you get
1. **Nginx config for 38.31.132.10 on port 443** (`deploy/nginx/ril-ip.conf`)
   - Uses a self-signed SSL certificate, because free certificates (Certbot) need a domain.
   - Website + /admin go to the app on port 3000; database/login/file calls go to the backend on port 8000.
   - Port 80 just redirects to https (optional, can be left closed).
   - No IPv6 lines (your server has IPv6 off).
   - Browsers will show a "Not secure" warning once until a domain + real certificate is added; then switch to `ril.conf` and run Certbot.
2. **Certificate script** (`deploy/nginx/make-selfsigned-cert.sh`) – one command creates the certificate for the IP.
3. **Table setup script** (`deploy/backend/supabase/run-migrations.sh`)
   - Runs 01_schema.sql (all tables, roles, security rules), 02_storage.sql (private files bucket), 03_super_admin.sql (makes your login Super Admin) inside the database container – no extra tools needed.
   - Safe to run again; shows a table count at the end.
4. **Frontend .env update**: `VITE_SUPABASE_URL=https://38.31.132.10` (backend reached through Nginx, so port 8000 never needs to be public).
5. **README section**: exact server commands in order — cert, nginx, migrations, create admin user in Studio, Super Admin SQL, build/deploy dist, PM2.

## Technical details
- `ril-ip.conf`: `server_name 38.31.132.10 _;` `ssl_certificate /etc/nginx/ssl/ril-ip.crt`; locations `/rest/v1/ /auth/v1/ /storage/v1/ /realtime/v1/` -> `http://127.0.0.1:8000` (websocket upgrade headers for realtime, `client_max_body_size 100m`), `/` -> `http://127.0.0.1:3000`.
- Cert: `openssl req -x509 -nodes -days 825 -newkey rsa:2048 -subj "/CN=38.31.132.10" -addext "subjectAltName=IP:38.31.132.10"`.
- Migrations: `docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < file.sql`.
- Backend `.env`: set `SITE_URL`, `API_EXTERNAL_URL`, `SUPABASE_PUBLIC_URL` to `https://38.31.132.10`, then `docker compose up -d`.
