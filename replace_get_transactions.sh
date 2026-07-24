cat << 'INNEREOF' > patch_get.js
const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoute = `  app.get("/api/transactions", (req, res) => {
    const enriched = transactions.map(t => {
      const member = members.find(m => m.id === t.memberId);
      return {
        ...t,
        username: member ? (member.name || "-") : "-",
        whatsapp: member ? (member.whatsapp || "-") : "-",
        telegram: member ? (member.telegram || "-") : "-"
      };
    });
    res.json({ success: true, transactions: enriched });
  });`;

code = code.replace(/app\.get\("\/api\/transactions", \(req, res\) => \{\s+res\.json\(\{ success: true, transactions \}\);\s+\}\);/g, newRoute);

fs.writeFileSync('server.ts', code);
INNEREOF
node patch_get.js
