#!/bin/bash
# setup-db.sh — Run once to create the seatfit PostgreSQL user and database.
# Run as: bash setup-db.sh

set -e

echo "Setting up SeatFit PostgreSQL database..."

# Try peer authentication (works on most Ubuntu installs)
sudo -u postgres psql << 'EOF'
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'seatfit') THEN
        CREATE USER seatfit WITH PASSWORD 'seatfit_dev';
        RAISE NOTICE 'User seatfit created.';
    ELSE
        RAISE NOTICE 'User seatfit already exists.';
    END IF;
END
$$;

SELECT 'CREATE DATABASE seatfit OWNER seatfit'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'seatfit')\gexec

GRANT ALL PRIVILEGES ON DATABASE seatfit TO seatfit;
EOF

echo "Done! Database 'seatfit' and user 'seatfit' are ready."
echo ""
echo "Now run: mvn spring-boot:run"
