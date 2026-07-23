const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  app.get("/api/status", async (req, res) => {
    try {
        let dfBalance = 0;
        if (digiflazzUsername && digiflazzApiKey) {
            const sign = crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + "depo").digest("hex");
            const dfRes = await fetch("https://api.digiflazz.com/v1/cek-saldo", {`;

const insert = `  let cachedDigiflazzBalance = 0;
  let lastBalanceFetch = 0;
  app.get("/api/status", async (req, res) => {
    try {
        if (digiflazzUsername && digiflazzApiKey) {
            const now = Date.now();
            if (now - lastBalanceFetch > 60000) {
                lastBalanceFetch = now;
                const sign = crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + "depo").digest("hex");
                const dfRes = await fetch("https://api.digiflazz.com/v1/cek-saldo", {`;

const replace2 = `            const dfJson = await dfRes.json();
            if (dfJson.data && dfJson.data.deposit) {
                dfBalance = dfJson.data.deposit;
            }
        }
        res.json({
            telegram: true,
            whatsapp: waSocket !== null && !waQR,
            database: true,
            digiflazz: !!(digiflazzUsername && digiflazzApiKey),
            digiflazzBalance: dfBalance
        });
    } catch (e) {
        console.error("Failed to fetch balance in status route", e);
        res.json({
            telegram: true,
            whatsapp: waSocket !== null && !waQR,
            database: true,
            digiflazz: !!(digiflazzUsername && digiflazzApiKey),
            digiflazzBalance: 0
        });
    }
  });`;

const insert2 = `            const dfJson = await dfRes.json();
            if (dfJson.data && dfJson.data.deposit) {
                cachedDigiflazzBalance = dfJson.data.deposit;
            }
            } // end if > 60000
        }
        res.json({
            telegram: true,
            whatsapp: waSocket !== null && !waQR,
            database: true,
            digiflazz: !!(digiflazzUsername && digiflazzApiKey),
            digiflazzBalance: cachedDigiflazzBalance
        });
    } catch (e) {
        console.error("Failed to fetch balance in status route", e);
        res.json({
            telegram: true,
            whatsapp: waSocket !== null && !waQR,
            database: true,
            digiflazz: !!(digiflazzUsername && digiflazzApiKey),
            digiflazzBalance: cachedDigiflazzBalance
        });
    }
  });`;

code = code.replace(target, insert);
code = code.replace(replace2, insert2);
fs.writeFileSync('server.ts', code);
console.log("Done patching status cache");
