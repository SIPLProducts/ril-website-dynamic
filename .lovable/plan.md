# Fix: View, Download, year collapse and /admin not working on the server

## What is actually wrong
The page text loads, but **nothing you click responds**: View, Download, the FY year collapse and the whole /admin area. That pattern means the page's interactive files (the `/assets/....js` files) return **404** on the server. Without them the browser shows only static text. This is the same "Failed to load resource: 404" you see in the console.

Usual causes (I'll confirm with one check):
- The running website (PM2) is an **old build**, while the page refers to files from a **newer build** (or the other way round), so the file names don't match.
- The browser has **cached old pages** that point to files that no longer exist.
- `dist/` was copied partly, or `npm run build` ran while PM2 kept serving the old folder.

## Fix steps
1. **Check:** a command that lists which `/assets/` file the page asks for and whether it exists in `dist/public/assets/` on the server.
2. **Clean rebuild:** stop PM2, delete `dist/`, run `npm run build`, start PM2 again from the same folder.
3. **Nginx:** serve `/assets/` straight from `dist/public/assets` with long-term caching, and stop caching the HTML pages. Then a rebuild can't leave old pages pointing at files that are gone.
4. **Browser:** hard refresh (Ctrl+Shift+R) or open a new Incognito window.
5. **Verify:** View and Download open the PDF, years collapse, and /admin/login loads.

## App changes
- Update `deploy/nginx/ril.conf` with a static `/assets/` location (both ports) and `Cache-Control: no-cache` on HTML.
- Add `deploy/redeploy.sh` that runs the clean rebuild in one command (stop, clean, build, restart, check assets), so this doesn't happen again.
- Make the investor file link (`/files/...`) report a clear reason when a file is missing instead of a bare 404.

## Technical details
- Nginx: `location ^~ /assets/ { alias /apps/website/ril-website/frontend/dist/public/assets/; expires 1y; add_header Cache-Control "public, immutable"; try_files $uri =404; }`, placed before `location /`; set `proxy_hide_header Cache-Control; add_header Cache-Control "no-cache";` on the HTML proxy.
- The check: `curl -sk https://10.200.1.8/ | grep -o '/assets/[^"]*\.js' | head` compared against `ls dist/public/assets`.
