#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
HERE=$(pwd)
PUBLIC_URL=https://ril.siplproducts.com
if [ ! -d supabase-src ]; then git clone --depth 1 https://github.com/supabase/supabase supabase-src; fi
mkdir -p supabase-docker && cp -rn supabase-src/docker/. supabase-docker/
cd supabase-docker
[ -f .env ] || cp .env.example .env
rnd(){ openssl rand -hex ${1:-24}; }
JWT=$(rnd 32)
b64(){ openssl base64 -A | tr '+/' '-_' | tr -d '='; }
mk(){ local h=$(printf '{"alg":"HS256","typ":"JWT"}' | b64)
      local p=$(printf '{"role":"%s","iss":"supabase","iat":1735689600,"exp":2050000000}' "$1" | b64)
      local s=$(printf '%s.%s' "$h" "$p" | openssl dgst -sha256 -hmac "$JWT" -binary | b64)
      echo "$h.$p.$s"; }
ANON=$(mk anon); SERVICE=$(mk service_role); DPASS=Ril$(rnd 8)
set_env(){ grep -q "^$1=" .env && sed -i "s|^$1=.*|$1=$2|" .env || echo "$1=$2" >> .env; }
if ! grep -q "^# RIL-CONFIGURED" .env; then
  set_env POSTGRES_PASSWORD "$(rnd 20)"
  set_env JWT_SECRET "$JWT"
  set_env ANON_KEY "$ANON"
  set_env SERVICE_ROLE_KEY "$SERVICE"
  set_env DASHBOARD_USERNAME ril_admin
  set_env DASHBOARD_PASSWORD "$DPASS"
  set_env SECRET_KEY_BASE "$(rnd 32)"
  set_env VAULT_ENC_KEY "$(rnd 16)"
  set_env SITE_URL "$PUBLIC_URL"
  set_env API_EXTERNAL_URL "$PUBLIC_URL"
  set_env SUPABASE_PUBLIC_URL "$PUBLIC_URL"
  set_env ADDITIONAL_REDIRECT_URLS "$PUBLIC_URL/admin,$PUBLIC_URL/admin/reset-password"
  set_env DISABLE_SIGNUP true
  set_env ENABLE_EMAIL_AUTOCONFIRM false
  echo "# RIL-CONFIGURED" >> .env
fi
docker compose pull
docker compose up -d
echo "Waiting for database..."; sleep 40
docker exec -i supabase-db psql -U postgres -d postgres < "$HERE/sql/01_schema.sql" || echo "Schema load warning - check output"
docker exec -i supabase-db psql -U postgres -d postgres < "$HERE/sql/02_storage.sql" || echo "Storage load warning"
. ./.env
echo "=============================================="
echo " Studio:    http://10.200.1.8:8000"
echo " Username:  $DASHBOARD_USERNAME"
echo " Password:  $DASHBOARD_PASSWORD"
echo " ANON_KEY (put in frontend .env):"; echo " $ANON_KEY"
echo " SERVICE_ROLE_KEY (server only, frontend .env):"; echo " $SERVICE_ROLE_KEY"
echo "=============================================="
