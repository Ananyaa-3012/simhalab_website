#!/usr/bin/env bash
# Start the SIMHA backend with proper LD_LIBRARY_PATH for libmagic
FILE_LIB=$(dirname "$(readlink -f "$(which file)")")/../lib
export LD_LIBRARY_PATH="$FILE_LIB:$LD_LIBRARY_PATH"
cd "$(dirname "$0")/backend"
exec python3 -m uvicorn app.main:app --reload --port 8000 "$@"
