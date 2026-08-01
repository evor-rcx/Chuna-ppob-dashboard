const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const batalCode = `
      bot.hears(["❌ Batal", "❌ Tidak"], async (ctx) => {
          const userId = ctx.from.id;
          const state = userStates[userId];
          let kb = [[{ text: "💵 Cek Saldo" }], [{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "📥 Fitur Download" }]];
          if (db.owners.includes(userId)) {
             kb.push([{ text: "👑 List Member" }, { text: "📒 Cek Utang Member" }]);
             kb.push([{ text: "💳 Saldo Pusat" }, { text: "⚙️ Pengaturan" }]);
          }
          if (state && state.data && state.data.memberId) {
              userStates[userId] = { step: 'LOCKED_MEMBER', data: { memberId: state.data.memberId } };
              await ctx.reply("❌ Dibatalkan. Kembali ke menu transaksi member offline.", {
                  reply_markup: { keyboard: [[{ text: "🧾 Cek Tagihan" }], [{ text: "📋 Menu Produk" }], [{ text: "🔙 Kembali ke Menu Owner" }]], resize_keyboard: true }
              });
              return;
          }
          delete userStates[userId];
          await ctx.reply("❌ Dibatalkan. Kembali ke menu utama.", {
              reply_markup: { keyboard: kb, resize_keyboard: true }
          });
      });
`;

code = code.replace(
    '      bot.on("text", async (ctx, next) => {',
    batalCode + '\n      bot.on("text", async (ctx, next) => {'
);

fs.writeFileSync('server.ts', code);
