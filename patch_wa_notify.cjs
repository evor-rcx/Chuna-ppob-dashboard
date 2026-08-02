const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Send TRANSAKSI DITOLAK to WA
const rejectMsgPrepaid = `
                if (member.balance < total) {
                    const isOwner = db.owners.includes(ctx.from?.id);
                    let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
                    if (isOwner) {
                        kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
                        kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
                    }
                    const msgText = \`❌ TRANSAKSI DITOLAK!
Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.
💳 Saldo Saat Ini: Rp \${member.balance.toLocaleString('id-ID')}
💰 Total Bayar: Rp \${total.toLocaleString('id-ID')}
Silakan isi ulang saldo kakak terlebih dahulu. 🙏\`;
                    
                    if (waSocket && member && member.whatsapp) {
                        let cleanWa = member.whatsapp.replace(/\\D/g, "");
                        if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                        const jid = cleanWa + "@s.whatsapp.net";
                        waSocket.sendMessage(jid, { text: msgText }).catch(()=>{});
                    }

                    return ctx.reply(msgText, { reply_markup: { keyboard: kb, resize_keyboard: true } });
                }`;

code = code.replace(
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
                }`, rejectMsgPrepaid);

// Also replace the second occurrence (Pasca)
code = code.replace(
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
                }`, rejectMsgPrepaid);


// 2. Send "Wrong PIN" to WA
const wrongPin = `
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        const wrongMsg = "😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿";
                        const sd = state.data;
                        const memberIdForPrepaid = sd.memberId || \`MBR-\${userId}\`;
                        const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid);
                        if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                            let cleanWa = memberForPrepaid.whatsapp.replace(/\\D/g, "");
                            if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                            const jid = cleanWa + "@s.whatsapp.net";
                            waSocket.sendMessage(jid, { text: wrongMsg }).catch(()=>{});
                        }
                        return ctx.reply(wrongMsg);
                    }`;

code = code.replace(
`                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }`, wrongPin);

code = code.replace(
`                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }`, wrongPin);

fs.writeFileSync('server.ts', code);
