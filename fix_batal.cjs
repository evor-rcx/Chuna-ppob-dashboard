const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix 1: In ASK_PIN_PREPAID and ASK_PIN_PASCA, handle '❌ Batal'
code = code.replace(
`                case 'ASK_PIN_PREPAID': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];`,
`                case 'ASK_PIN_PREPAID': {
                    const pinEntered = text.trim();
                    if (pinEntered === '❌ Batal' || pinEntered.toLowerCase() === 'batal') {
                        delete userStates[userId];
                        const isOwner = db.owners.includes(userId);
                        let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
                        if (isOwner) {
                            kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
                            kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
                        }
                        await ctx.reply("❌ Transaksi dibatalkan.", { reply_markup: { keyboard: kb, resize_keyboard: true } });
                        return;
                    }
                    const regUser = registeredUsers[userId];`
);

code = code.replace(
`                case 'ASK_PIN_PASCA': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];`,
`                case 'ASK_PIN_PASCA': {
                    const pinEntered = text.trim();
                    if (pinEntered === '❌ Batal' || pinEntered.toLowerCase() === 'batal') {
                        delete userStates[userId];
                        const isOwner = db.owners.includes(userId);
                        let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
                        if (isOwner) {
                            kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
                            kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
                        }
                        await ctx.reply("❌ Transaksi dibatalkan.", { reply_markup: { keyboard: kb, resize_keyboard: true } });
                        return;
                    }
                    const regUser = registeredUsers[userId];`
);

// Fix 2: Ensure insufficient balance sends the main menu keyboard back
code = code.replace(
`                if (member.balance < total) {
                    return ctx.reply(\`❌ TRANSAKSI DITOLAK!
Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.
💳 Saldo Saat Ini: Rp \${member.balance.toLocaleString('id-ID')}
💰 Total Bayar: Rp \${total.toLocaleString('id-ID')}
Silakan isi ulang saldo kakak terlebih dahulu. 🙏\`);
                }`,
`                if (member.balance < total) {
                    const isOwner = db.owners.includes(ctx.from?.id);
                    let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
                    if (isOwner) {
                        kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
                        kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
                    }
                    return ctx.reply(\`❌ TRANSAKSI DITOLAK!
Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.
💳 Saldo Saat Ini: Rp \${member.balance.toLocaleString('id-ID')}
💰 Total Bayar: Rp \${total.toLocaleString('id-ID')}
Silakan isi ulang saldo kakak terlebih dahulu. 🙏\`, { reply_markup: { keyboard: kb, resize_keyboard: true } });
                }`
);

// There are two occurrences of this (Prepaid and Pasca)
code = code.replace(
`                if (member.balance < total) {
                    return ctx.reply(\`❌ TRANSAKSI DITOLAK!
Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.
💳 Saldo Saat Ini: Rp \${member.balance.toLocaleString('id-ID')}
💰 Total Bayar: Rp \${total.toLocaleString('id-ID')}
Silakan isi ulang saldo kakak terlebih dahulu. 🙏\`);
                }`,
`                if (member.balance < total) {
                    const isOwner = db.owners.includes(ctx.from?.id);
                    let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
                    if (isOwner) {
                        kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
                        kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
                    }
                    return ctx.reply(\`❌ TRANSAKSI DITOLAK!
Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.
💳 Saldo Saat Ini: Rp \${member.balance.toLocaleString('id-ID')}
💰 Total Bayar: Rp \${total.toLocaleString('id-ID')}
Silakan isi ulang saldo kakak terlebih dahulu. 🙏\`, { reply_markup: { keyboard: kb, resize_keyboard: true } });
                }`
);

fs.writeFileSync('server.ts', code);
