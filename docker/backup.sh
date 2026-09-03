#!/bin/sh
# Dumps the Postgres database to a timestamped file. Run from the docker/ directory:
#   ./backup.sh
# Copy the resulting file off the server periodically (it is NOT uploaded anywhere automatically).
set -e

cd "$(dirname "$0")"
mkdir -p backups

TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
OUT="backups/re_zero_crm_${TIMESTAMP}.sql"

docker compose exec -T db pg_dump -U "${POSTGRES_USER:-rezero}" "${POSTGRES_DB:-re_zero_crm}" > "$OUT"

echo "Backup written to docker/$OUT"
