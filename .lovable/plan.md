# Fix Docker "snapshot already exists" error during Supabase image pull

## What happened
Internet and Docker are working (images started downloading). The error is a known Docker bug: when 11 images download at the same time, two share a layer and collide ("target snapshot already exists"). Docker then stops all the others ("Interrupted"). Nothing is broken; the downloads just need to run one at a time.

## Commands to run on the server now (no code change needed)
```text
cd /apps/website/ril-website/backend/supabase/supabase-src/docker   # folder with docker-compose.yml
sudo systemctl restart docker
sudo docker compose pull --policy missing --parallel 1 || \
  for s in $(sudo docker compose config --services); do sudo docker compose pull $s; done
sudo docker compose up -d
sudo docker compose ps        # all should show "healthy"/"running"
```
If the same error still appears for one image: `sudo docker image prune -f`, restart docker, and pull that single service again (e.g. `sudo docker compose pull db`).

Then re-run `sudo bash install-supabase.sh` — already-downloaded images are skipped and it continues to load the RIL schema and print the keys.

## Permanent fix in the deploy folder (after approval)
- Update `deploy/backend/supabase/install-supabase.sh` to: install Docker automatically if missing, pull images one by one with retry (3 attempts each), then start containers and wait until the database is healthy before loading the SQL.
- Replace `cp -n` with `cp --update=none` to remove the warning.
- Add a "Troubleshooting: snapshot already exists" note to `deploy/README.md`.
