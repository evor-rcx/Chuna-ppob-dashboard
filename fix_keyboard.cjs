const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const rejectMsg = `return ctx.reply(\`❌ TRANSAKSI DITOLAK!Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.💳 Saldo Saat Ini: Rp \${member.balance.toLocaleString('id-ID')}💰 Total Bayar: Rp \${total.toLocaleString('id-ID')}Silakan isi ulang saldo kakak terlebih dahulu. 🙏\`, { reply_markup: { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]], resize_keyboard: true } });`;

code = code.replace(/return ctx\.reply\(\`❌ TRANSAKSI DITOLAK!Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini\.💳 Saldo Saat Ini: Rp \$\{member\.balance\.toLocaleString\('id-ID'\)\}💰 Total Bayar: Rp \$\{total\.toLocaleString\('id-ID'\)\}Silakan isi ulang saldo kakak terlebih dahulu\. 🙏\`\);/g, rejectMsg);

fs.writeFileSync('server.ts', code);
