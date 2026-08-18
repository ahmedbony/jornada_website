#!/bin/sh
# Seed data files into the volume if they don't exist yet (first run)
for f in options.json resources.json option-details.json taxonomy.json analytics.json; do
  if [ ! -f "/app/data/$f" ]; then
    if [ -f "/app/data-seed/$f" ]; then
      cp "/app/data-seed/$f" "/app/data/$f"
      echo "[WAM] Seeded $f"
    fi
  fi
done

echo "[WAM] Starting server..."
exec node server/index.cjs
