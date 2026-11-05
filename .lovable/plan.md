# Add a `deploy/` folder to the project, plus a step-by-step server guide

## Your questions answered
- **Is Supabase needed?** Yes. It stores all admin data (Investors, Clientele, Accolades, Sustainability, Management, Footer, Home), admin logins and User Management, and uploaded PDFs and images. On your server it runs in Docker.
- **Is a separate backend needed?** No. The website and admin panel share one app, which handles its own server work. "Backend" on your server means only Supabase in Docker.

## Folder layout on the server (/apps/website/ril-website)
```text
ril-website/
  frontend/        built website + admin (dist/), .env, PM2 start file
  backend/
    supabase/      Docker Compose for self-hosted Supabase, .env, setup SQL
  nginx/           ril.conf (port 443 + port 80 redirect)
```

## What will be added to the project (in git, under `deploy/`)
1. `deploy/frontend/`: `.env.example` (points to http://38.31.132.10 Supabase), `ecosystem.config.cjs` for PM2, `deploy.sh` (unpack dist, restart).
2. `deploy/backend/supabase/`: `docker-compose.yml` (official Supabase stack), `.env.example` (dashboard username/password, DB password, keys), `generate-keys.sh`, `sql/01_schema.sql` (all tables, roles and security rules), `sql/02_storage.sql` (private `investor-documents` bucket), `sql/03_super_admin.sql` (makes your account Super Admin).
3. `deploy/nginx/ril.conf`: one site for website + `/admin` on 443, a port 80 redirect, `/supabase/` proxied to Supabase, no IPv6 listen lines (your server has IPv6 turned off).
4. `deploy/README.md`: the full order of steps.
5. App change: admin user create/delete, SMTP, login codes and careers form read the self-hosted Supabase private key from the server `.env`, and email sending uses plain Node SMTP on your server. These features then work on your server too.

## Deployment flow
```text
Laptop: git pull -> npm install -> npm run build -> dist/
        copy dist/ + deploy/ to server (WinSCP)
Server: 1. Install Docker (over HTTPS, port 443)
        2. backend/supabase: generate keys, docker compose up -d
        3. Open Studio, log in with dashboard user, run sql/01..03
        4. frontend: put .env, pm2 start ecosystem.config.cjs
        5. nginx: copy ril.conf, nginx -t, reload
        6. Certbot SSL for ril.siplproducts.com (once DNS points to 38.31.132.10)
        7. Optional: copy current data from Lovable Cloud (export/import script)
```

## Also delivered
An updated Word guide with these exact steps and the folder paths shown above.

## Notes
- Docker images download from Docker Hub over port 443. That port is open on your server.
- Supabase Studio stays internal (only reachable at 10.200.1.8:8000), not public.
