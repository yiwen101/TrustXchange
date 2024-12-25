#!/bin/bash

# Start the development server in the background and redirect output to dev_output.log
npm run dev > dev_output.log 2>&1 &
DEV_PID=$!

# Function to clean up the background process on exit
cleanup() {
  kill $DEV_PID
  exit
}
trap cleanup SIGINT SIGTERM

# Wait until the log file contains the URL, then extract the port
while true; do
  if grep -q 'Local:.*http://localhost:[0-9]\+/' dev_output.log; then
    echo $(cat dev_output.log)
    NPM_BROWSER_PORT=$(grep 'Local:.*http://localhost:' dev_output.log | head -n1 | sed -E 's/.*http:\/\/localhost:([0-9]+)\/.*/\1/')
    echo "Extracted port: $NPM_BROWSER_PORT"
    break
  fi
  sleep 1
done

# Open the browser with the extracted port
open "http://localhost:$NPM_BROWSER_PORT/"

# Wait for the development server process
wait $DEV_PID