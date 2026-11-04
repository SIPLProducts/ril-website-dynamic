# Self-hosting setup guide (document)

Create a clear step-by-step Word document (`/mnt/documents/RIL_Self_Hosting_Setup_Guide.docx`) for server **10.200.1.8**, installing into **/apps** (68 GB free; /opt has only 3 GB so it is not used). No website code changes.

## Approach that avoids backend issues
Only the website + admin panel run on your server. The database, logins and uploaded files stay in Lovable Cloud exactly as today, so nothing needs installing or migrating for them — admin edits keep showing instantly and there is no separate database to set up or break.

## Contents
1. **Overview** — what runs where, and a simple diagram.
2. **Server check** — your disk layout, Node/RAM check, outbound HTTPS (port 443) must be allowed to the Lovable Cloud address.
3. **Install software** — Node.js 22 LTS, Git, Nginx, PM2, Certbot (copy-paste commands, Ubuntu and RHEL variants).
4. **Get the code** — download codebase into `/apps/ril-website`.
5. **Settings file** — exact `.env` with the real public website keys (filled in, no guessing).
6. **Build & run** — Node server build, start with PM2 on port 3000, auto-start on reboot, logs in `/apps/ril-website/logs`.
7. **Nginx + HTTPS** — ready config for `ril.siplproducts.com`; note that 10.200.1.8 is an internal IP, so the network team must map the public IP/firewall (NAT) to it and point DNS there.
8. **Email (SMTP)** — set in Admin → Email Configuration.
9. **Updating the site** — 3 commands.
10. **Health checks** — how to confirm site, admin login and file downloads work.
11. **Troubleshooting** — 502, blank page, login fails, files not loading, port blocked.

## Technical notes
- Verify the Node build (`NITRO_PRESET=node-server`, output `.output/server/index.mjs`) in the sandbox and start it once to confirm pages load before writing steps.
- Render the document pages to images and check them before delivering.
