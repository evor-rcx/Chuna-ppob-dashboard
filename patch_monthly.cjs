const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const monthlyCode = `
app.get("/api/monthly-summary", (req, res) => {
  const monthsMap: Record<string, { month: string, digitalCuan: number, physicalCuan: number, expenses: number, totalCuan: number }> = {};

  const getMonthKey = (dateStr: string) => {
      const d = new Date(dateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return \`\${yyyy}-\${mm}\`;
  };

  const ensureMonth = (key: string) => {
      if (!monthsMap[key]) {
          monthsMap[key] = { month: key, digitalCuan: 0, physicalCuan: 0, expenses: 0, totalCuan: 0 };
      }
      return monthsMap[key];
  };

  for (const t of db.transactions || []) {
      if (t.status === 'Sukses' && t.cuan) {
          const m = ensureMonth(getMonthKey(t.date));
          m.digitalCuan += t.cuan;
      }
  }

  for (const tx of (db.physicalTransactions || [])) {
      const m = ensureMonth(getMonthKey(tx.date));
      let modal = 0;
      for (const item of tx.items) {
          modal += (item.buyPrice || 0) * item.quantity;
      }
      m.physicalCuan += (tx.total - modal);
  }

  for (const exp of (db.expenses || [])) {
      const m = ensureMonth(getMonthKey(exp.date));
      m.expenses += exp.amount;
  }

  const data = Object.values(monthsMap).sort((a, b) => b.month.localeCompare(a.month));
  for (const m of data) {
      m.totalCuan = m.digitalCuan + m.physicalCuan - m.expenses;
  }

  res.json({ success: true, data });
});
`;

code = code.replace(
    /app\.get\("\/api\/summary", \(req, res\) => \{[\s\S]*?\}\);/,
    match => match + '\n\n' + monthlyCode
);

fs.writeFileSync('server.ts', code);
