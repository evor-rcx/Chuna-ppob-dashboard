const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getMenuCode = `
                        let returnMarkup;
                        if (db.owners.includes(userId)) {
                            returnMarkup = {
                                keyboard: [
                                    [{ text: "📒 Cek Utang Member" }],
                                    [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                    [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                    [{ text: "📢 Pengumuman WA" }],
                                    [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                                ],
                                resize_keyboard: true
                            };
                        } else {
                            returnMarkup = { keyboard: [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]], resize_keyboard: true };
                        }
`;

code = code.replace(/await ctx\.reply\("❌ Pembelian dibatalkan\.", \{ reply_markup: \{ keyboard: \[\[\{ text: "💵 Cek Saldo" \}\], \[\{ text: "🧾 Cek Tagihan" \}\], \[\{ text: "📋 Menu Produk" \}\], \[\{ text: "📥 Download" \}, \{ text: "🎵 Lirik Lagu" \}\]\], resize_keyboard: true \} \}\);/g,
  getMenuCode + 'await ctx.reply("❌ Pembelian dibatalkan.", { reply_markup: returnMarkup });');

code = code.replace(/await ctx\.reply\("❌ Pengecekan dibatalkan\.", \{ reply_markup: \{ keyboard: \[\[\{ text: "💵 Cek Saldo" \}\], \[\{ text: "🧾 Cek Tagihan" \}\], \[\{ text: "📋 Menu Produk" \}\], \[\{ text: "📥 Download" \}, \{ text: "🎵 Lirik Lagu" \}\]\], resize_keyboard: true \} \}\);/g,
  getMenuCode + 'await ctx.reply("❌ Pengecekan dibatalkan.", { reply_markup: returnMarkup });');

code = code.replace(/await ctx\.reply\("❌ Pembayaran dibatalkan\.", \{ reply_markup: \{ keyboard: \[\[\{ text: "💵 Cek Saldo" \}\], \[\{ text: "🧾 Cek Tagihan" \}\], \[\{ text: "📋 Menu Produk" \}\], \[\{ text: "📥 Download" \}, \{ text: "🎵 Lirik Lagu" \}\]\], resize_keyboard: true \} \}\);/g,
  getMenuCode + 'await ctx.reply("❌ Pembayaran dibatalkan.", { reply_markup: returnMarkup });');

fs.writeFileSync('server.ts', code);
console.log("Fixed other menus!");
