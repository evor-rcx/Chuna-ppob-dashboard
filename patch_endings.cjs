const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
        delete userStates[ctx.from?.id || 0];
        const isOwner = db.owners.includes(ctx.from?.id);
        if (isOwner) {
            await ctx.reply("Silakan pilih menu selanjutnya:", {
                reply_markup: {
                    keyboard: [
                        [{ text: "📒 Cek Utang Member" }],
                        [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                        [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                        [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]
                    ],
                    resize_keyboard: true
                }
            });
        } else {
            await ctx.reply("Silakan pilih menu selanjutnya:", {
                reply_markup: {
                    keyboard: [
                        [{ text: "💵 Cek Saldo" }],
                        [{ text: "🧾 Cek Tagihan" }],
                        [{ text: "📋 Menu Produk" }],
                        [{ text: "📥 Fitur Download" }]
                    ],
                    resize_keyboard: true
                }
            });
        }
`;

code = code.replace(/        if \(stateData\.memberId\) \{\n            userStates\[ctx\.from\?\.id \|\| 0\] = \{ step: 'LOCKED_MEMBER', data: \{ memberId: stateData\.memberId \} \};\n        \} else \{\n            delete userStates\[ctx\.from\?\.id \|\| 0\];\n        \}/g, replacement);

fs.writeFileSync('server.ts', code);
console.log("Endings patched!");
