const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the bot.start block
const startBlockRegex = /bot\.start\(async \(ctx\) => \{[\s\S]*?(?=bot\.hears\("📒 Cek Utang Member")/g;

const newStartBlock = `bot.start(async (ctx) => {
        const userId = ctx.from.id;
        
        let voiceExists = false;
        let voicePayload: any = null;
        let welcomeVoiceFileId: string | null = db.welcomeVoiceFileId || null;
        
        const opusPath = require('path').join(process.cwd(), "welcome.opus");
        if (require('fs').existsSync(opusPath)) {
            if (welcomeVoiceFileId) {
                voicePayload = welcomeVoiceFileId;
                voiceExists = true;
            } else {
                voicePayload = { source: opusPath };
                voiceExists = true;
            }
        }

        let isOwner = db.owners.includes(userId);
        const memberId = \`MBR-\${userId}\`;
        const member = members.find(m => m.id === memberId || (m.telegram && m.telegram.toString().includes(userId.toString())));
        
        let msgText = "";
        let keyboardData: any = [];

        if (isOwner) {
            msgText = "👑 DASHBOARD E4 STORE\\nSelamat datang bosku! Mau kelola apa hari ini?";
            keyboardData = [
                [{ text: "📋 Menu Produk" }],
                [{ text: "📒 Cek Utang Member" }, { text: "🧾 Cek Tagihan" }],
                [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                [{ text: "📢 Pengumuman WA" }],
                [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
            ];
        } else if (member) {
            msgText = "✅ Welcome back kak di E4 Store Official! 🥰\\n\\nMau transaksi apa hari ini kak bareng Chuna?";
            keyboardData = [
                [{ text: "💵 Cek Saldo" }],
                [{ text: "🧾 Cek Tagihan" }],
                [{ text: "📋 Menu Produk" }],
                [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
            ];
        } else {
            msgText = "👋 Halo kak! Chuna di sini 🚗💚\\n\\nKakak belum punya akun E4 Store nih. Daftar dulu yuk biar bisa langsung belanja! 🛍️";
            keyboardData = [
                [{ text: "📝 Daftar Bareng Chuna" }]
            ];
        }

        try {
            if (voiceExists && voicePayload) {
                const msg = await ctx.replyWithVoice(voicePayload, {
                    caption: msgText,
                    reply_markup: { keyboard: keyboardData, resize_keyboard: true }
                });
                if (msg && typeof msg === 'object' && 'voice' in msg && !welcomeVoiceFileId) {
                    db.welcomeVoiceFileId = (msg as any).voice.file_id;
                    writeDB(db);
                }
            } else {
                await ctx.reply(msgText, {
                    reply_markup: { keyboard: keyboardData, resize_keyboard: true }
                });
            }
        } catch (error) {
            console.error("Gagal mengirim pesan /start:", error);
            // Fallback just in case voice fails completely
            if (voiceExists) {
                 await ctx.reply(msgText, {
                    reply_markup: { keyboard: keyboardData, resize_keyboard: true }
                }).catch(e => console.error("Fallback gagal:", e));
            }
        }
      });

      `;

code = code.replace(startBlockRegex, newStartBlock);

// Also fix the SALDO PUSAT newline issue
code = code.replace(/💳 \*SALDO PUSAT \(DIGIFLAZZ\)\*Status:/g, '💳 *SALDO PUSAT (DIGIFLAZZ)*\\nStatus:');
code = code.replace(/Status: \$\{digiflazzStatus\}Saldo Saat Ini:/g, 'Status: ${digiflazzStatus}\\nSaldo Saat Ini:');

fs.writeFileSync('server.ts', code);
console.log("Updated bot.start block and fixed newlines");
