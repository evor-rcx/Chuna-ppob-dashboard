import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_loop = """
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
"""

new_loop = """
              try {
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
              } catch (err) {
                  console.error("Error polling tx " + tx.id, err);
              }
"""

if "Error polling tx" not in content:
    content = content.replace(old_loop, new_loop)
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Already patched")
