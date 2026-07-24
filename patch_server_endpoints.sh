#!/bin/bash
sed -i '/\/\/ --- Digiflazz API Routes ---/i \
  // --- Dashboard Data ---\
  let transactions: any[] = [];\
  let members = [\
    { id: "MBR-001", name: "Toko Budi Cell", whatsapp: "081234567890", telegram: "@budicell", balance: 150000, type: "VIP" },\
    { id: "MBR-002", name: "Rudi Agen", whatsapp: "089876543210", telegram: "@rudiagen", balance: 25000, type: "Biasa" },\
  ];\
\
  app.get("/api/summary", (req, res) => {\
    res.json({\
      success: true,\
      summary: {\
        pendapatan: digiflazzBalance,\
        produkTerlaris: transactions.length,\
        statusServer: digiflazzStatus\
      }\
    });\
  });\
\
  app.get("/api/transactions", (req, res) => {\
    res.json({ success: true, transactions });\
  });\
\
  app.get("/api/members", (req, res) => {\
    res.json({ success: true, members });\
  });\
\
  app.post("/api/members/:id/topup", (req, res) => {\
    const { id } = req.params;\
    const { amount } = req.body;\
    const member = members.find(m => m.id === id);\
    if (member) {\
      member.balance += amount;\
      res.json({ success: true, member });\
    } else {\
      res.status(404).json({ success: false, error: "Member not found" });\
    }\
  });\
\
  app.post("/api/members/:id/type", (req, res) => {\
    const { id } = req.params;\
    const { type } = req.body;\
    const member = members.find(m => m.id === id);\
    if (member) {\
      member.type = type;\
      res.json({ success: true, member });\
    } else {\
      res.status(404).json({ success: false, error: "Member not found" });\
    }\
  });\
' server.ts
