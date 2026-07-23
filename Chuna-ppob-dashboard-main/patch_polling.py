import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

polling_code = """
  // Polling Digiflazz pending transactions
  setInterval(async () => {
      try {
          if (!digiflazzUsername || !digiflazzApiKey) return;
          const pendingTxs = transactions.filter(t => t.status === 'Pending');
          for (const tx of pendingTxs) {
              let body: any = {
                  username: digiflazzUsername,
                  buyer_sku_code: tx.sku,
                  customer_no: tx.target,
                  ref_id: tx.id,
                  sign: crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + tx.id).digest("hex")
              };
              
              if (tx.type === 'pasca') {
                  body.commands = "pay-pasca";
              }

              const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body)
              });
              const json = await res.json();
              
              if (json && json.data && (json.data.status === 'Sukses' || json.data.status === 'Gagal')) {
                  // Forward to local webhook
                  await fetch(`http://127.0.0.1:${PORT}/webhook`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ data: json.data })
                  }).catch(e => console.error("Error forwarding webhook:", e));
              }
          }
      } catch (e) {
          console.error("Polling error:", e);
      }
  }, 30000); // 30 seconds
"""

if "Polling Digiflazz pending transactions" not in content:
    content = content.replace('async function startServer() {', 'async function startServer() {\n' + polling_code)
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Already patched")
