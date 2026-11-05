# Open the RIL website on the server — checklist (no code changes)

Your Nginx file is correct. Nginx printed nothing, so first confirm it's actually active.

## 1. Turn on the site in Nginx
```bash
sudo ln -sf /etc/nginx/sites-available/ril-website /etc/nginx/sites-enabled/ril-website
sudo rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/ril
sudo nginx -t
sudo systemctl reload nginx
```
`nginx -t` must say "syntax is ok" and "test is successful".

## 2. Make sure the website app is running (port 3000)
```bash
cd /apps/website/ril-website/frontend
pm2 status                      # ril-website should be "online"
# if not:
pm2 start dist/server/index.mjs --name ril-website --node-args="--env-file=.env"
pm2 save
curl -I http://127.0.0.1:3000   # should show HTTP/1.1 200
```

## 3. Make sure the database is running (port 8000)
```bash
cd /apps/website/ril-website/backend/supabase/supabase-src/docker
sudo docker compose ps          # all should be running/healthy
curl -I http://127.0.0.1:8000/auth/v1/health
```

## 4. Test through Nginx on the server
```bash
curl -kI https://127.0.0.1/          # 200 = website OK
curl -kI https://127.0.0.1/admin     # 200 (internal)
```

## 5. Open in a browser
| Who | Address |
|---|---|
| Office (website) | https://10.200.1.8 |
| Office (admin) | https://10.200.1.8/admin |
| Public internet (website) | https://38.31.132.10 (needs IT to open 443 to the public IP) |
| Public /admin | blocked (403) — by design |

Browser will show "Not secure" because the *.ramky.com certificate doesn't match an IP. Click **Advanced → Proceed**. For a clean lock, IT adds DNS e.g. ril.ramky.com -> 38.31.132.10, then add that name to `server_name`, `.env` VITE_SUPABASE_URL and rebuild.

## If something fails
Send the output of: `sudo nginx -t`, `pm2 logs ril-website --lines 30`, `sudo tail -20 /var/log/nginx/error.log`.
