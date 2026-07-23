#!/bin/bash
# 1. Add global variable for gopayStatus
sed -i '/let digiflazzStatus = "Disconnected";/i \
let gopayStatus = "Disconnected";\
' server.ts

# 2. Add routes for /api/gopay/status and /api/gopay/configure
sed -i '/\/\/ --- Digiflazz API Routes ---/i \
  // --- GoPay API Routes ---\
  app.get("/api/gopay/status", (req, res) => {\
    res.json({ status: gopayStatus });\
  });\
\
  app.post("/api/gopay/configure", async (req, res) => {\
    const { merchantId, clientKey } = req.body;\
    \
    if (!merchantId || !clientKey) {\
      return res.status(400).json({ error: "Merchant ID dan Client Key diperlukan" });\
    }\
\
    try {\
      // Dummy check for GoPay\
      if (clientKey.length < 5) {\
          throw new Error("Invalid Client Key");\
      }\
      \
      gopayStatus = "Connected as " + merchantId;\
      \
      res.json({ success: true, message: "GoPay connected successfully", status: gopayStatus });\
    } catch (err: any) {\
      console.error("GoPay Error:", err);\
      gopayStatus = "Error: " + err.message;\
      res.status(500).json({ success: false, error: err.message });\
    }\
  });\
' server.ts
