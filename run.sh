#!/usr/bin/env bash
# Local preview for the static portfolio (no Java/Maven required)
cd "$(dirname "$0")"
echo "Portfolio running at http://localhost:8080"
echo "Press Ctrl+C to stop."
exec python3 -m http.server 8080 --directory src/main/resources/static
