import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the webhook fetch in the interval
old_fetch = """                    if (json && json.data && (json.data.status === 'Sukses' || json.data.status === 'Gagal')) {
                      // Forward to local webhook
                      await fetch(`http://127.0.0.1:${PORT}/webhook`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ data: json.data })
                      }).catch(e => console.error("Error forwarding webhook:", e));
                  }"""

new_fetch = """                    if (json && json.data && (json.data.status === 'Sukses' || json.data.status === 'Gagal')) {
                      await processDigiflazzWebhookData(json.data);
                  }"""

content = content.replace(old_fetch, new_fetch)


# Now extract logic from route
# The route starts around line 190

old_route_start = """  app.post(["/api/digiflazz-webhook", "/webhook"], async (req, res) => {
    try {
        const payload = req.body;
        if (!payload || !payload.data) return res.status(400).send("Bad Request");
        
        const data = payload.data;
        const ref_id = data.ref_id;
        const status = data.status;"""


new_route_start = """  async function processDigiflazzWebhookData(data: any) {
    try {
        const ref_id = data.ref_id;
        const status = data.status;"""


old_route_end = """        res.json({ success: true });
    } catch(e) {
        console.error("Webhook error", e);
        res.status(500).send("Error");
    }
  });"""

new_route_end = """    } catch(e) {
        console.error("Webhook error", e);
    }
  }

  app.post(["/api/digiflazz-webhook", "/webhook"], async (req, res) => {
    try {
        const payload = req.body;
        if (!payload || !payload.data) return res.status(400).send("Bad Request");
        await processDigiflazzWebhookData(payload.data);
        res.json({ success: true });
    } catch(e) {
        console.error("Webhook route error", e);
        res.status(500).send("Error");
    }
  });"""

if "async function processDigiflazzWebhookData(data: any)" not in content:
    content = content.replace(old_route_start, new_route_start)
    content = content.replace(old_route_end, new_route_end)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done patching webhook")
