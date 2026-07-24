const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const stateBlock = `
                case 'AWAITING_DOWNLOAD_LINK': {
                    const link = text.trim();
                    if (link.toLowerCase() === 'batal' || link === '🔙 Kembali ke Menu Owner' || link === '💵 Cek Saldo' || link === '🧾 Cek Tagihan' || link === '📋 Menu Produk') {
                        delete userStates[userId];
                        await ctx.reply("❌ Download dibatalkan.", {
                            reply_markup: {
                                keyboard: db.owners.includes(userId) ? 
                                [
                                    [{ text: "📒 Cek Utang Member" }],
                                    [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                                    [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                                    [{ text: "📢 Pengumuman WA" }, { text: "📥 Fitur Download" }]
                                ] :
                                [
                                    [{ text: "💵 Cek Saldo" }],
                                    [{ text: "🧾 Cek Tagihan" }],
                                    [{ text: "📋 Menu Produk" }],
                                    [{ text: "📥 Fitur Download" }]
                                ],
                                resize_keyboard: true
                            }
                        });
                        return;
                    }
                    if (!link.startsWith('http')) {
                        await ctx.reply("❌ Link tidak valid. Harap kirimkan link yang diawali dengan http/https.");
                        return;
                    }

                    // Save link to state so we can use it in callback
                    userStates[userId] = { step: 'AWAITING_DOWNLOAD_TYPE', data: { link: link } };
                    
                    await ctx.reply("Link terdeteksi! Silakan pilih format yang ingin didownload di bawah ini 👇", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "📸 Gambar", callback_data: "dl_image" }],
                                [{ text: "🎥 Video", callback_data: "dl_video" }],
                                [{ text: "🎵 Audio / MP3", callback_data: "dl_audio" }]
                            ]
                        }
                    });
                    return;
                }
`;

if (!code.includes("case 'AWAITING_DOWNLOAD_LINK':")) {
    code = code.replace(/switch \(state\.step\) \{/, "switch (state.step) {\n" + stateBlock);
    fs.writeFileSync('server.ts', code);
    console.log("Download state added!");
} else {
    console.log("Download state already exists.");
}

