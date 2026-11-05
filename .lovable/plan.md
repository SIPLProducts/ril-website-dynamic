# Fix: "docker: command not found" + ready-to-use Docker Compose

## Why it failed
The script cloned fine, but Docker is not installed on the server (10.200.1.8). The server only has internet on port 443 (HTTPS), so Docker must be installed from Docker's HTTPS repository.

## What I will add/change in `deploy/backend/supabase/`

1. **`install-docker.sh`** (new) — installs Docker Engine + Compose plugin from `https://download.docker.com` (HTTPS only), enables the service, adds your user to the `docker` group, and checks `docker compose version`. Handles IPv6-disabled servers (sets Docker `"ipv6": false`).

2. **`docker-compose.yml` + `.env.example` + `volumes/`** (new, shipped in our deploy folder) — a fixed, pinned copy of the official self-hosted stack (db, auth, rest, storage, realtime, kong gateway, studio, meta, imgproxy). No 600 MB git clone needed anymore.
   - Pinned image versions (no surprise breakage).
   - Data stored under `/apps/website/ril-website/backend/supabase/volumes` (67 GB disk, not /opt).
   - Gateway on `127.0.0.1:8000` + `10.200.1.8:8000` only (Studio stays internal); Nginx proxies public traffic.
   - Unneeded services removed (analytics/logflare, edge functions, vector, pooler) to fit 2 vCPU / 7.4 GB RAM and reduce failure points.
   - Health checks so services start in the right order.

3. **`install-supabase.sh`** (rewritten)
   - Stops early with a clear message if Docker is missing (points to `install-docker.sh`).
   - Uses the bundled compose file; generates passwords/JWT keys once into `.env`.
   - Waits until the database is actually healthy (instead of sleep 40), then loads `01_schema.sql` and `02_storage.sql`.
   - Strips Windows line endings itself; uses `cp --update=none` (no warning).
   - Prints Studio URL, username, password, ANON_KEY, SERVICE_ROLE_KEY.

4. **README.md** — updated order: `install-docker.sh` → `install-supabase.sh` → create admin in Studio → `03_super_admin.sql` → frontend → Nginx. Includes check/stop/restart/backup commands and common errors.

## Commands you will run on the server
```text
cd /apps/website/ril-website/backend/supabase
sed -i 's/\r$//' *.sh
sudo bash install-docker.sh
sudo bash install-supabase.sh
```

## Notes
- I can validate the compose file syntax here, but cannot run Docker on your real server; image downloads go through port 443 (Docker Hub), which your firewall allows.
- You can delete the old `supabase-src` folder afterwards.
