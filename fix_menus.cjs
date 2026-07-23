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

code = code.replace(/await ctx\.reply\("❌ Download dibatalkan\.", \{ reply_markup: \{ keyboard: \[\[\{ text: "💵 Cek Saldo" \}\], \[\{ text: "🧾 Cek Tagihan" \}\], \[\{ text: "📋 Menu Produk" \}\], \[\{ text: "📥 Download" \}, \{ text: "🎵 Lirik Lagu" \}\]\], resize_keyboard: true \} \}\);/g, 
  getMenuCode + 'await ctx.reply("❌ Download dibatalkan.", { reply_markup: returnMarkup });');

code = code.replace(/await ctx\.reply\("Menu Utama", \{ reply_markup: \{ keyboard: \[\[\{ text: "💵 Cek Saldo" \}\], \[\{ text: "🧾 Cek Tagihan" \}\], \[\{ text: "📋 Menu Produk" \}\], \[\{ text: "📥 Download" \}, \{ text: "🎵 Lirik Lagu" \}\]\], resize_keyboard: true \} \}\);/g,
  getMenuCode + 'await ctx.reply("Menu Utama", { reply_markup: returnMarkup });');

code = code.replace(/await ctx\.reply\("❌ Pencarian dibatalkan\.", \{ reply_markup: \{ keyboard: \[\[\{ text: "💵 Cek Saldo" \}\], \[\{ text: "🧾 Cek Tagihan" \}\], \[\{ text: "📋 Menu Produk" \}\], \[\{ text: "📥 Download" \}, \{ text: "🎵 Lirik Lagu" \}\]\], resize_keyboard: true \} \}\);/g,
  getMenuCode + 'await ctx.reply("❌ Pencarian dibatalkan.", { reply_markup: returnMarkup });');

fs.writeFileSync('server.ts', code);
console.log("Fixed menus!");
