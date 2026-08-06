#!/usr/bin/env bash
# Start the SIMHA frontend dev server
cd "$(dirname "$0")/frontend"
exec npx vite --port 5173 "$@"
