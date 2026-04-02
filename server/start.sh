#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Simple wait loop for postgres
until bunx prisma db push --accept-data-loss; do
  echo "Database is not ready yet, retrying in 2 seconds..."
  sleep 2
done

echo "Database is ready and migrated. Starting server..."
exec bun run index.ts
