const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update Menu
code = code.replace(/bot\.hears\("📢 Pengumuman WA", async \(ctx\) => \{[\s\S]*?resize_keyboard: true\n\s*\}\n\s*\}\);\n\s*\}\);/,
`      bot.hears("📢 Pengumuman WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'ANNOUNCEMENT_MENU', data: {} };
          
          const status = db.waAnnouncementEnabled ? "🟢 AKTIF" : "🔴 NONAKTIF";
          await ctx.reply(\`📢 Menu Pengumuman WA (Otomatis 1 Jam):\\nStatus saat ini: \${status}\`, {
              reply_markup: {
                  keyboard: [
                      [{ text: "🎯 Set Target WA" }],
                      [{ text: "📢 Buat Pengumuman" }],
                      [{ text: "🛑 Matikan Pengumuman" }, { text: "▶️ Aktifkan Pengumuman" }],
                      [{ text: "🔙 Kembali ke Menu Owner" }]
                  ],
                  resize_keyboard: true
              }
          });
      });`);

// Add handlers for Matikan / Aktifkan
const toggleHandlers = `
      bot.hears("🛑 Matikan Pengumuman", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          db.waAnnouncementEnabled = false;
          writeDB(db);
          await ctx.reply("🛑 Pengumuman otomatis berhasil dimatikan.");
      });

      bot.hears("▶️ Aktifkan Pengumuman", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          if (!db.waAnnouncementText) {
              return ctx.reply("❌ Teks pengumuman belum ada. Silakan buat pengumuman terlebih dahulu.");
          }
          db.waAnnouncementEnabled = true;
          writeDB(db);
          await ctx.reply("▶️ Pengumuman otomatis berhasil diaktifkan. Akan dikirim setiap 1 jam.");
      });
`;

code = code.replace(/bot\.hears\("🎯 Set Target WA", async \(ctx\) => \{/, toggleHandlers + "\n      bot.hears(\"🎯 Set Target WA\", async (ctx) => {");

// Update AWAITING_ANNOUNCEMENT_TEXT logic
code = code.replace(/case 'AWAITING_ANNOUNCEMENT_TEXT':[\s\S]*?return;/m,
`              case 'AWAITING_ANNOUNCEMENT_TEXT':
                if (text === "🔙 Kembali ke Menu Owner") return; // Let it fall through to the handler
                const targetAnnounce = db.waAnnouncementTarget;
                if (!targetAnnounce) {
                    await ctx.reply("❌ Target WA belum diatur!");
                    delete userStates[userId];
                    return;
                }
                
                db.waAnnouncementText = text;
                db.waAnnouncementEnabled = true;
                writeDB(db);
                
                await ctx.reply("✅ Teks pengumuman berhasil disimpan dan diaktifkan (otomatis kirim setiap 1 jam). Sedang mencoba mengirim percobaan pertama...");
                delete userStates[userId];
                
                if (waSocket) {
                    try {
                        await waSocket.sendMessage(targetAnnounce, { text: text });
                    } catch (err: any) {
                        await ctx.reply("⚠️ Gagal mengirim percobaan pertama: " + err.message);
                    }
                } else {
                    await ctx.reply("⚠️ WhatsApp belum terhubung. Pengumuman akan dikirim saat WA terhubung.");
                }
                return;`);

// Add setInterval at the top-ish (after checkPascaBill or anywhere at top level)
const intervalCode = `
setInterval(async () => {
    if (db.waAnnouncementEnabled && db.waAnnouncementText && db.waAnnouncementTarget && waSocket) {
        try {
            await waSocket.sendMessage(db.waAnnouncementTarget, { text: db.waAnnouncementText });
            console.log("Auto announcement sent to " + db.waAnnouncementTarget);
        } catch (e: any) {
            console.error("Failed to send auto announcement:", e.message);
        }
    }
}, 60 * 60 * 1000);
`;

code = code.replace(/let digiflazzBalance = 0;/, "let digiflazzBalance = 0;\n" + intervalCode);

fs.writeFileSync('server.ts', code);
