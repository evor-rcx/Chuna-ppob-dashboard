const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const missingHandlers = `
      bot.hears("📋 Menu Produk", async (ctx) => {
          const categories = Array.from(new Set(digiflazzProducts.map((p: any) => p.category)));
          const keyboard = [];
          for (let i = 0; i < categories.length; i += 2) {
              const row = [{ text: categories[i] }];
              if (categories[i + 1]) row.push({ text: categories[i + 1] });
              keyboard.push(row);
          }
          if (db.owners.includes(ctx.from.id)) {
              keyboard.push([{ text: "🔙 Kembali ke Menu Owner" }]);
          } else {
              keyboard.push([{ text: "🔙 Kembali" }]);
          }
          await ctx.reply("📋 Silakan pilih kategori produk:", {
              reply_markup: { keyboard: keyboard, resize_keyboard: true }
          });
      });

      bot.hears("💵 Cek Saldo", async (ctx) => {
          const userId = ctx.from.id;
          const memberId = \`MBR-\${userId}\`;
          const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, userId, ctx.from?.username));
          if (!member) return ctx.reply("❌ Kakak belum terdaftar!");
          await ctx.reply(\`💵 *Saldo Saat Ini:*\nRp \${(member.balance || 0).toLocaleString('id-ID')}\n\nBelanja makin mudah pakai Saldo! ✨\`, { parse_mode: 'Markdown' });
      });

      bot.hears("🧾 Cek Tagihan", async (ctx) => {
          const userId = ctx.from.id;
          const memberId = \`MBR-\${userId}\`;
          const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, userId, ctx.from?.username));
          if (!member) return ctx.reply("❌ Kakak belum terdaftar!");
          const pendingTxs = transactions.filter(t => t.memberId === member.id && t.status === 'Pending');
          if (pendingTxs.length === 0) {
              return ctx.reply("🎉 Yeay! Kakak tidak punya tagihan aktif saat ini.");
          }
          let msg = "🧾 *Daftar Tagihan Aktif:*\n\n";
          pendingTxs.forEach((tx, i) => {
              msg += \`*\${i+1}. \${tx.product}*\n\`;
              msg += \`Tujuan: \${tx.target}\n\`;
              msg += \`Harga: Rp \${(tx.price || 0).toLocaleString('id-ID')}\n\n\`;
          });
          await ctx.reply(msg, { parse_mode: 'Markdown' });
      });

      bot.hears("📝 Daftar Bareng Chuna", async (ctx) => {
          const userId = ctx.from.id;
          await ctx.reply("Halo kak! Untuk pendaftaran, silakan hubungi admin untuk verifikasi nomor WhatsApp ya! 🥰");
      });

      bot.hears("📥 Download", async (ctx) => {
          userStates[ctx.from.id] = { step: 'AWAITING_DOWNLOAD', data: {} };
          await ctx.reply("Kirimin link video TikTok, Instagram, atau YouTube yang mau di-download kak! 👇", {
              reply_markup: { keyboard: [[{ text: "❌ Batal" }]], resize_keyboard: true }
          });
      });

      bot.hears("🎵 Lirik Lagu", async (ctx) => {
          userStates[ctx.from.id] = { step: 'AWAITING_LYRIC', data: {} };
          await ctx.reply("Ketik judul lagu dan penyanyinya kak! Biar Chuna carikan liriknya 🎵", {
              reply_markup: { keyboard: [[{ text: "❌ Batal" }]], resize_keyboard: true }
          });
      });

      bot.hears("🔙 Kembali ke Menu Owner", async (ctx) => {
          delete userStates[ctx.from.id];
          await ctx.reply("👑 DASHBOARD E4 STORE\\nSelamat datang bosku! Mau kelola apa hari ini?", {
              reply_markup: {
                  keyboard: [
                      [{ text: "📋 Menu Produk" }],
                      [{ text: "📒 Cek Utang Member" }, { text: "🧾 Cek Tagihan" }],
                      [{ text: "📝 Tambah Member" }, { text: "👑 List Member" }],
                      [{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }],
                      [{ text: "📢 Pengumuman WA" }],
                      [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                  ],
                  resize_keyboard: true
              }
          });
      });

      bot.hears("🔙 Kembali", async (ctx) => {
          delete userStates[ctx.from.id];
          await ctx.reply("Mau transaksi apa hari ini kak bareng Chuna?", {
              reply_markup: {
                  keyboard: [
                      [{ text: "💵 Cek Saldo" }],
                      [{ text: "🧾 Cek Tagihan" }],
                      [{ text: "📋 Menu Produk" }],
                      [{ text: "📥 Download" }, { text: "🎵 Lirik Lagu" }]
                  ],
                  resize_keyboard: true
              }
          });
      });

      `;

code = code.replace(/bot\.hears\("📒 Cek Utang Member"/, missingHandlers + 'bot.hears("📒 Cek Utang Member"');

fs.writeFileSync('server.ts', code);
console.log("Added missing handlers");
