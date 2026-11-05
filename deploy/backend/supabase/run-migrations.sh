#!/usr/bin/env bash
# Loads all tables, storage bucket and Super Admin into the self-hosted database.
# Usage: sudo bash run-migrations.sh   (run from this folder)
set -e
cd "$(dirname "$0")"
DB=$(docker ps --format '{{.Names}}' | grep -E '^supabase-db$|supabase.*db' | head -1)
[ -z "$DB" ] && { echo "Database container not running. Start Supabase first."; exit 1; }
for f in sql/01_schema.sql sql/02_storage.sql sql/03_super_admin.sql; do
  echo ">> $f"
  docker exec -i "$DB" psql -U postgres -d postgres -v ON_ERROR_STOP=0 < "$f"
done
echo ">> Tables in public schema:"
docker exec -i "$DB" psql -U postgres -d postgres -tAc "select count(*) from information_schema.tables where table_schema='public'"
