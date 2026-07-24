#!/bin/bash
sed -i '/app\.get("\/api\/members", (req, res) => {/i \
  app.get("/api/members/offline", (req, res) => {\
    res.json({ success: true, members: [] });\
  });\
' server.ts
