#!/bin/sh
set -e

: "${PGDATA:=/var/lib/postgresql/data}"
: "${POSTGRES_USER:=hanwha}"
: "${POSTGRES_PASSWORD:=hanwha_local}"
: "${POSTGRES_DB:=hanwhagreen}"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "Initializing PostgreSQL data directory..."
  initdb -D "$PGDATA" --auth-local=trust --auth-host=trust
  echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
  {
    echo "host all all 0.0.0.0/0 trust"
    echo "host all all ::/0 trust"
  } >> "$PGDATA/pg_hba.conf"
fi

if [ ! -f "$PGDATA/.bootstrapped" ]; then
  echo "Creating database user and database..."
  pg_ctl -D "$PGDATA" -w start
  psql -v ON_ERROR_STOP=1 --username postgres <<EOSQL
CREATE ROLE ${POSTGRES_USER} LOGIN PASSWORD '${POSTGRES_PASSWORD}' SUPERUSER;
EOSQL
  psql -v ON_ERROR_STOP=1 --username postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}'" | grep -q 1 \
    || psql -v ON_ERROR_STOP=1 --username postgres -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};"
  pg_ctl -D "$PGDATA" -m fast -w stop
  touch "$PGDATA/.bootstrapped"
fi

echo "Starting PostgreSQL..."
exec postgres -D "$PGDATA"
