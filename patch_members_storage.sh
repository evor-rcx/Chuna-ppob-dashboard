#!/bin/bash
sed -i '1s/^/import fs from "fs";\n/' server.ts

# Create an initial db.json if it doesn't exist
cat << 'JSON' > db.json
{
  "members": [],
  "transactions": [],
  "registeredUsers": {}
}
JSON

