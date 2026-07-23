#!/bin/bash

# Fix GoPay dummy check
sed -i 's/\/\/ Dummy check for GoPay//g' server.ts
sed -i 's/if (clientKey.length < 5) {/if (!clientKey) {/g' server.ts
sed -i 's/throw new Error("Invalid Client Key");/throw new Error("Client Key diperlukan");/g' server.ts

# Fix Telegram dummy saldo
cat << 'REPLACE' > tmp_saldo.txt
      bot.command("saldo", async (ctx) => {
        if (digiflazzStatus.includes("Connected")) {
          ctx.reply(`💰 Saldo Digiflazz saat ini: Rp ${digiflazzBalance.toLocaleString('id-ID')}`);
        } else {
          ctx.reply("❌ Sistem pembayaran belum terhubung.");
        }
      });

      bot.command("harga", (ctx) => {
        ctx.reply("🛒 *Menu Produk*\nSilakan gunakan tombol menu untuk melihat produk yang tersedia dari server.", { parse_mode: "Markdown" });
      });

      bot.action("cek_saldo", async (ctx) => {
        try {
          await ctx.answerCbQuery();
          if (digiflazzStatus.includes("Connected")) {
            await ctx.reply(`💰 Saldo Digiflazz saat ini: Rp ${digiflazzBalance.toLocaleString('id-ID')}`);
          } else {
            await ctx.reply("❌ Sistem belum terhubung ke Digiflazz.");
          }
        } catch (e) {
          console.error("Failed to answer callback query:", e);
        }
      });

      bot.action("cek_tagihan", async (ctx) => {
        try {
          await ctx.answerCbQuery();
          await ctx.reply("🧾 Fitur tagihan sedang dalam tahap integrasi PPOB.");
        } catch (e) {
          console.error("Failed to answer callback query:", e);
        }
      });

      bot.action("menu_produk", async (ctx) => {
        try {
          await ctx.answerCbQuery();
          if (digiflazzStatus.includes("Connected")) {
            await ctx.reply("🛒 Mengambil daftar produk dari Digiflazz...");
          } else {
            await ctx.reply("❌ Sistem belum terhubung ke Digiflazz.");
          }
        } catch (e) {
          console.error("Failed to answer callback query:", e);
        }
      });
REPLACE

sed -i '/bot\.command("saldo", (ctx) => {/,/bot\.action("menu_produk", async (ctx) => {/d' server.ts
sed -i '/bot\.launch();/i \
      bot.command("saldo", async (ctx) => {\
        if (digiflazzStatus.includes("Connected")) {\
          ctx.reply(`💰 Saldo Digiflazz saat ini: Rp ${digiflazzBalance.toLocaleString('\''id-ID'\'')}`);\
        } else {\
          ctx.reply("❌ Sistem pembayaran belum terhubung.");\
        }\
      });\
\
      bot.command("harga", (ctx) => {\
        ctx.reply("🛒 *Menu Produk*\\nSilakan gunakan tombol menu untuk melihat produk yang tersedia dari server.", { parse_mode: "Markdown" });\
      });\
\
      bot.action("cek_saldo", async (ctx) => {\
        try {\
          await ctx.answerCbQuery();\
          if (digiflazzStatus.includes("Connected")) {\
            await ctx.reply(`💰 Saldo Digiflazz saat ini: Rp ${digiflazzBalance.toLocaleString('\''id-ID'\'')}`);\
          } else {\
            await ctx.reply("❌ Sistem belum terhubung ke Digiflazz.");\
          }\
        } catch (e) {\
          console.error("Failed to answer callback query:", e);\
        }\
      });\
\
      bot.action("cek_tagihan", async (ctx) => {\
        try {\
          await ctx.answerCbQuery();\
          await ctx.reply("🧾 Fitur tagihan sedang dalam tahap integrasi PPOB.");\
        } catch (e) {\
          console.error("Failed to answer callback query:", e);\
        }\
      });\
\
      bot.action("menu_produk", async (ctx) => {\
        try {\
          await ctx.answerCbQuery();\
          if (digiflazzStatus.includes("Connected")) {\
            await ctx.reply("🛒 Sedang memproses... Silakan cek menu secara langsung di aplikasi untuk melihat daftar produk.");\
          } else {\
            await ctx.reply("❌ Sistem belum terhubung ke Digiflazz.");\
          }\
        } catch (e) {\
          console.error("Failed to answer callback query:", e);\
        }\
      });\
' server.ts

# Remove the trailing catch from the previous menu_produk because it might be orphaned. Let's do it carefully.
