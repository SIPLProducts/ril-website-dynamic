#!/usr/bin/env bash
# Run on the server inside /apps/website/ril-website/frontend after uploading ril-dist.tar.gz
set -e
cd /apps/website/ril-website/frontend
[ -f .env ] || { echo "Create .env first (copy .env.example)"; exit 1; }
if [ -f ril-dist.tar.gz ]; then rm -rf dist && tar -xzf ril-dist.tar.gz && rm ril-dist.tar.gz; fi
[ -d node_modules/nodemailer ] || npm install --no-save --no-package-lock nodemailer@6
pm2 startOrReload ecosystem.config.cjs && pm2 save
echo "Website running on 127.0.0.1:3000"
