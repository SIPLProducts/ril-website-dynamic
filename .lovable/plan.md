# Self-hosting setup guide (document)

Create a step-by-step Word document (`/mnt/documents/RIL_Self_Hosting_Setup_Guide.docx`) your IT team can follow on the Linux server. No website code changes.

## Contents
1. **Overview** — what runs on your server (the website + admin panel) and what stays in Lovable Cloud (database, logins, uploaded files), so admin edits keep showing instantly.
2. **Server requirements** — 2 vCPU / 4 GB RAM (8 GB optional), Ubuntu 22.04/24.04, ~50 GB SSD with app in `/opt`, open ports 80/443, domain `ril.siplproducts.com` DNS pointed to server.
3. **Install software** — Node.js 22 LTS, Git, Nginx, PM2, Certbot (exact commands).
4. **Get the code** — download from Lovable / Git into `/opt/ril-website`.
5. **Settings file** — the `.env` values needed (website address, public key, server key placeholder) and where to keep them safely.
6. **Build for Node server** — switch build target from the default Cloudflare to Node (`NITRO_PRESET=node-server`), run install + build, start with PM2, auto-start on reboot.
7. **Nginx + HTTPS** — reverse proxy config to port 3000, free SSL certificate via Certbot, auto-renew.
8. **Email (SMTP)** — configure in Admin → Email Configuration for OTP, reset and careers mail.
9. **Updating the site** — pull new code, rebuild, `pm2 restart`.
10. **Backups & monitoring** — logs, health check, data export.
11. **Troubleshooting** — common errors (blank page, 502, login fails, uploads not showing).
12. **Optional: move data fully in-house** — outline of exporting database and files later.

## Technical notes
- Verify the Node build command works in the sandbox (`NITRO_PRESET=node-server` build output at `.output/server/index.mjs`) before writing the steps.
- Render pages to images and check layout before delivering.
