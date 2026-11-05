# Make admin login work on http://10.200.1.8 (stop calling the public IP)

## Why it happens
When the site was built on the server, the backend address was set to `https://38.31.132.10`. That address is fixed inside the built files, so every login from `http://10.200.1.8` still sends the password check to the public IP — which internal PCs/VPN cannot reach (hairpin NAT), so "SIGNING IN..." hangs.

## Fix: the website uses whatever address you opened it with
- Opened as `http://10.200.1.8` -> login goes to `http://10.200.1.8/auth/...`
- Opened as `https://38.31.132.10` (or a domain later) -> goes there
No rebuild needed when the IP or domain changes.

## Steps
1. Change the self-host build setting so the browser's backend address = the current page address (server side keeps using `http://127.0.0.1:8000`). Lovable's own hosting is untouched.
2. Update the Nginx config so the port 80 block also forwards `/auth/v1/`, `/rest/v1/`, `/storage/v1/`, `/functions/v1/`, `/realtime/v1/` to `127.0.0.1:8000` (same as the 443 block).
3. You then on the server: pull the new code, `npm run build`, run `deploy.sh`, `pm2 restart ril-website --update-env`, `sudo nginx -t && sudo systemctl reload nginx`.
4. Test: open `http://10.200.1.8/admin/login` in Incognito, DevTools > Network: the `token?grant_type=password` request should show `http://10.200.1.8/auth/v1/...` and status 200.

## Technical details
- In `vite.config.ts` (self-host branch only) add `define` for `import.meta.env.VITE_SUPABASE_URL` as the expression `(typeof window !== 'undefined' ? window.location.origin : process.env.SUPABASE_URL)`.
- Update `deploy/nginx/ril.conf` port-80 server with the API proxy locations (with Upgrade headers for realtime); update `deploy/frontend/.env.example` comment.

## Works for every address
Domain (e.g. ril.ramky.com), public IP and private IP all work. The login goes to the same address the page was opened on, and Nginx on that address passes it to the backend running on the server.
