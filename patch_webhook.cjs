const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  app.post(["/api/digiflazz-webhook", "/webhook"], async (req, res) => {
    try {
        const payload = req.body;
        if (!data) return { success: false };
        await processDigiflazzWebhookData(payload.data);`;

const replacement = `  app.post(["/api/digiflazz-webhook", "/webhook"], express.json(), async (req, res) => {
    try {
        const payload = req.body;
        if (!payload || !payload.data) return res.json({ success: false, msg: "No payload" });
        await processDigiflazzWebhookData(payload.data);`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched Webhook");
