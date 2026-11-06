#!/usr/bin/env bash
# Run on the server inside /apps/website/ril-website/frontend after uploading ril-dist.tar.gz
# Clean redeploy: stop, replace dist, restart, then confirm the page's script files exist.
set -e
cd /apps/website/ril-website/frontend
[ -f .env ] || { echo "Create .env first (copy .env.example)"; exit 1; }
if [ -f ril-dist.tar.gz ]; then
  pm2 stop ril-website >/dev/null 2>&1 || true
  rm -rf dist && tar -xzf ril-dist.tar.gz && rm ril-dist.tar.gz
fi
[ -f dist/server/index.mjs ] || { echo "dist/server/index.mjs missing - upload a full build"; exit 1; }
[ -d node_modules/nodemailer ] || npm install --no-save --no-package-lock nodemailer@6
chmod -R o+rX dist/public
pm2 delete ril-website >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs && pm2 save
sudo nginx -t && sudo systemctl reload nginx
sleep 3
echo "Checking page script files..."
missing=0
for f in $(curl -s http://127.0.0.1:3000/ | grep -o '/assets/[^"]*\.\(js\|css\)' | sort -u); do
  if [ -f "dist/public$f" ]; then echo "OK   $f"; else echo "MISSING $f"; missing=1; fi
done
[ $missing = 0 ] && echo "All files present. Hard refresh the browser (Ctrl+Shift+R)." || echo "Some files missing - rebuild and upload again."
