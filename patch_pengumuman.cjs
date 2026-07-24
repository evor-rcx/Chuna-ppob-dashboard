const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add to owner menu
code = code.replace(/\[\{ text: "💳 Saldo Pusat" \}, \{ text: "⚙️ Pengaturan" \}\]/g, 
`[{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }]`);

// Add bot.hears("📢 Pengumuman WA")
const pengumumanCommand = `
      bot.hears("📢 Pengumuman WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'ANNOUNCEMENT_MENU' };
          await ctx.reply("📢 Menu Pengumuman WA:", {
              reply_markup: {
                  keyboard: [
                      [{ text: "🎯 Set Target WA" }],
                      [{ text: "📢 Buat Pengumuman" }],
                      [{ text: "🔙 Kembali ke Menu Owner" }]
                  ],
                  resize_keyboard: true
              }
          });
      });

      bot.hears("🎯 Set Target WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'AWAITING_WA_TARGET' };
          const currentTarget = db.waAnnouncementTarget || "Belum diatur";
          await ctx.reply(\`Target WA saat ini: *\${currentTarget}*\\n\\nKirimkan Target ID / Nomor WA tujuan pengumuman (contoh: 120363393336519112@g.us):\`, { parse_mode: 'Markdown' });
      });

      bot.hears("📢 Buat Pengumuman", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          const target = db.waAnnouncementTarget;
          if (!target) {
              return ctx.reply("❌ Target WA belum diatur! Silakan Set Target WA terlebih dahulu.");
          }
          userStates[ctx.from.id] = { step: 'AWAITING_ANNOUNCEMENT_TEXT' };
          await ctx.reply(\`Kirimkan teks pengumuman yang ingin dikirimkan ke target *\${target}*:\\n\\n(Bisa multi-baris)\`, { parse_mode: 'Markdown' });
      });
`;

code = code.replace(/bot\.hears\("📝 Tambah Member", async \(ctx\) => \{/, pengumumanCommand + "\n      bot.hears(\"📝 Tambah Member\", async (ctx) => {");

// Add cases in switch
const newCases = `
              case 'AWAITING_WA_TARGET':
                db.waAnnouncementTarget = text;
                writeDB(db);
                delete userStates[userId];
                await ctx.reply(\`✅ Target ID *\${text}* telah diatur sebagai tujuan pengumuman.\`, { parse_mode: 'Markdown' });
                return;

              case 'AWAITING_ANNOUNCEMENT_TEXT':
                if (text === "🔙 Kembali ke Menu Owner") return; // Let it fall through to the handler
                const target = db.waAnnouncementTarget;
                if (!target) {
                    await ctx.reply("❌ Target WA belum diatur!");
                    delete userStates[userId];
                    return;
                }
                if (!waSocket) {
                    await ctx.reply("❌ Sistem WhatsApp belum terhubung!");
                    return;
                }
                try {
                    await waSocket.sendMessage(target, { text: text });
                    await ctx.reply("✅ Pengumuman berhasil dikirim ke WhatsApp!");
                    delete userStates[userId];
                } catch (err: any) {
                    await ctx.reply("❌ Gagal mengirim pengumuman: " + err.message);
                }
                return;
`;

code = code.replace(/case 'AWAITING_USERNAME':/, newCases + "\n              case 'AWAITING_USERNAME':");

fs.writeFileSync('server.ts', code);
