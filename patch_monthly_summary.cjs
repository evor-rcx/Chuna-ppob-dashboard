const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.get\("\/api\/summary", \(req, res\) => \{[\s\S]*?\}\);/g;
const match = code.match(regex);
if (match) {
    const summaryApi = match[0];
    const monthlySummaryApi = `app.get("/api/monthly-summary", (req, res) => {
    const dataMap = new Map();

    const getMonthStr = (dateStr) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return null;
            return d.toISOString().substring(0, 7); // YYYY-MM
        } catch(e) { return null; }
    };

    const getOrInit = (month) => {
        if (!dataMap.has(month)) {
            dataMap.set(month, { month, digitalCuan: 0, physicalCuan: 0, expenses: 0, totalCuan: 0 });
        }
        return dataMap.get(month);
    };

    transactions.forEach(t => {
        if (t.status === 'Sukses' && t.cuan && t.date) {
            const m = getMonthStr(t.date);
            if (m) {
                const d = getOrInit(m);
                d.digitalCuan += t.cuan;
                d.totalCuan += t.cuan;
            }
        }
    });

    physicalTransactions.forEach(t => {
        if (t.status === 'Sukses' && t.cuan && t.date) {
            const m = getMonthStr(t.date);
            if (m) {
                const d = getOrInit(m);
                d.physicalCuan += t.cuan;
                d.totalCuan += t.cuan;
            }
        }
    });

    expenses.forEach(e => {
        if (e.date) {
            const m = getMonthStr(e.date);
            if (m) {
                const d = getOrInit(m);
                d.expenses += e.amount;
                d.totalCuan -= e.amount;
            }
        }
    });

    const data = Array.from(dataMap.values()).sort((a, b) => b.month.localeCompare(a.month));

    res.json({ success: true, data });
  });`;

    code = code.replace(summaryApi, summaryApi + "\n\n  " + monthlySummaryApi);
    fs.writeFileSync('server.ts', code);
    console.log("Patched monthly summary!");
} else {
    console.log("Summary API not found!");
}
