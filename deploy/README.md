# RIL Website – Self-Hosted Deployment (server 10.200.1.8, public IP 38.31.132.10)

## What runs where
| Folder on server | What it is | Port |
|---|---|---|
| `/apps/website/ril-website/frontend` | Website + `/admin` portal (one Node app, run by PM2) | 3000 (internal) |
| `/apps/website/ril-website/backend/supabase` | Supabase in Docker: database, admin logins/User Management, uploaded files | 8000 (internal only) |
| `/apps/website/ril-website/nginx` | Nginx config: public HTTPS entry | 443 (+80 redirect) |

There is no separate Node "backend": the app's server code is inside `dist/server`. Supabase is the backend.

```text
Visitor -> https://ril.siplproducts.com (443) -> Nginx
   /rest /auth /storage /realtime  -> Supabase (127.0.0.1:8000)
   everything else (site + /admin) -> Node app (127.0.0.1:3000) -> Supabase
```

## Step 0 – Server prerequisites (already done: Node 22, npm, PM2, Nginx)
Install Docker (HTTPS only, works with your firewall):
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # log out and back in
docker compose version
```

## Step 1 – Copy this `deploy/` folder to the server
```bash
sudo mkdir -p /apps/website/ril-website/{frontend,backend,nginx}
# WinSCP: deploy/frontend/* -> frontend/, deploy/backend/supabase -> backend/, deploy/nginx/* -> nginx/
```

## Step 2 – Start Supabase (backend)
```bash
cd /apps/website/ril-website/backend/supabase
sudo bash install-supabase.sh
```
It downloads Supabase, creates passwords/keys, starts Docker, loads all tables (`sql/01_schema.sql`) and the private file bucket (`sql/02_storage.sql`). **Save the printed Studio username, password, ANON_KEY and SERVICE_ROLE_KEY.**

Open Studio from inside the office network: `http://10.200.1.8:8000` and log in with that username/password.

## Step 3 – Create the Super Admin
1. Studio → Authentication → Users → Add user (your email + password, Auto confirm ON).
2. Studio → SQL Editor → paste `sql/03_super_admin.sql` (change email/name) → Run.

## Step 4 – Build on your laptop
```bash
git pull
npm install
cp deploy/frontend/.env.example .env     # paste ANON_KEY into VITE_SUPABASE_PUBLISHABLE_KEY
npm run build                            # creates dist/
tar -czf ril-dist.tar.gz dist
```
Upload `ril-dist.tar.gz` to `/apps/website/ril-website/frontend/`.

## Step 5 – Start the website
```bash
cd /apps/website/ril-website/frontend
cp .env.example .env && nano .env        # paste ANON_KEY and SERVICE_ROLE_KEY
bash deploy.sh                           # unpacks dist, installs mail library, starts PM2
pm2 startup                              # run the command it prints, so it restarts after reboot
curl -I http://127.0.0.1:3000            # should show 200
```

## Step 6 – Nginx + SSL
```bash
sudo cp /apps/website/ril-website/nginx/ril.conf /etc/nginx/sites-available/ril
sudo ln -sf /etc/nginx/sites-available/ril /etc/nginx/sites-enabled/ril
sudo rm -f /etc/nginx/sites-enabled/default
# First SSL certificate (needs DNS ril.siplproducts.com -> 38.31.132.10 and port 80 open):
sudo certbot certonly --webroot -w /var/www/html -d ril.siplproducts.com
sudo nginx -t && sudo systemctl reload nginx
```
If port 80 can't be opened, ask IT for a company SSL certificate and put its paths in `ril.conf`.

## Step 7 – Email (OTP, password reset, careers applications)
Admin → Email Configuration: enter your company SMTP host/port/user/password → Send test → Save.

## Updating the site later
Laptop: `npm run build && tar -czf ril-dist.tar.gz dist` → upload → server: `bash deploy.sh`.

## Firewall checklist for IT
- Inbound 443 (and 80 for SSL renewal) from internet → 38.31.132.10 → 10.200.1.8
- Port 8000 and 3000: internal only, never public
- Outbound 443 for Docker image download (already open)

## Moving existing data (optional)
The self-hosted database starts empty. Ask us to export current content from Lovable Cloud as SQL and run it in Studio → SQL Editor.
