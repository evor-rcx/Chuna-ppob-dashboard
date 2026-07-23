const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `        res.json({ success: true });
    } catch(e) {
        console.error("Webhook route error", e);
        res.status(500).send("Error");
    }
  });`;

const replacement = `        return { success: true };
    } catch(e) {
        console.error("processDigiflazzWebhookData error", e);
        return { success: false };
    }
  }

  app.post("/api/bot/webhook", async (req, res) => {
    try {
        const payload = req.body;
        if (payload.data) {
            await processDigiflazzWebhookData(payload.data);
        }
        res.json({ success: true });
    } catch(e) {
        console.error("Webhook route error", e);
        res.status(500).send("Error");
    }
  });`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Fixed syntax!");
