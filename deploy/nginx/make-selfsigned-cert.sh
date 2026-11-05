#!/usr/bin/env bash
# Creates an SSL certificate for the IP addresses (no domain needed). Run once with sudo.
set -e
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/ril-ip.key -out /etc/nginx/ssl/ril-ip.crt \
  -subj "/CN=38.31.132.10" \
  -addext "subjectAltName=IP:38.31.132.10,IP:10.200.1.8"
chmod 600 /etc/nginx/ssl/ril-ip.key
echo "Certificate created in /etc/nginx/ssl/"
