#!/bin/bash
# Quick verification script for campaign seeding via Supabase SQL interface

# Read the SQL file we generated
SQL_FILE="/tmp/seed.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "SQL file not found"
  exit 1
fi

# The SQL is ready in the file - you would run this via:
# psql "$POSTGRES_URL" < /tmp/seed.sql
# or through Supabase Dashboard SQL Editor

echo "Generated SQL file ready at: $SQL_FILE"
echo ""
echo "To seed the database, run one of:"
echo "1. In Supabase Dashboard: Copy the SQL and run in SQL Editor"
echo "2. Via psql: psql \"\$POSTGRES_URL\" < $SQL_FILE"
echo "3. Via the /admin/seed page in the app (once started)"
echo ""
echo "First 50 lines of SQL:"
head -50 "$SQL_FILE"
