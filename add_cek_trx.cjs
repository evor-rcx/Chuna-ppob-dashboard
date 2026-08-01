const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const cekTrxCode = `
      bot.hears(/^Cek Trx (.+)$/i, async (ctx) => {
          const ref_id = ctx.match[1].trim();
          const tx = transactions.find(t => t.id === ref_id);
          if (!tx) return ctx.reply("❌ Transaksi dengan Ref ID " + ref_id + " tidak ditemukan di sistem Chuna.");
          
          if (!digiflazzUsername || !digiflazzApiKey) return ctx.reply("Konfigurasi Digiflazz belum diatur.");
          
          await ctx.reply("⏳ Chuna sedang mengecek ulang status transaksi " + ref_id + " ke Digiflazz pusat...");
          
          let body = {
              username: digiflazzUsername,
              buyer_sku_code: tx.sku,
              customer_no: tx.target.split(' ')[0],
              ref_id: tx.id,
              sign: crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + tx.id).digest("hex")
          };
          if (tx.type === 'pasca') body.commands = "status-pasca";
          
          try {
              const res = await fetch("https://api.digiflazz.com/v1/transaction", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body)
              });
              const json = await res.json();
              if (json && json.data) {
                  await ctx.reply("✅ Laporan Digiflazz:\\nStatus: " + json.data.status + "\\nPesan: " + (json.data.message || '-') + "\\nSN: " + (json.data.sn || '-'));
                  if (tx.status === 'Pending' && (json.data.status === 'Sukses' || json.data.status === 'Gagal')) {
                      await processDigiflazzWebhookData(json.data);
                      await ctx.reply("Sistem telah diupdate otomatis berdasarkan status terbaru dari Digiflazz! Saldo akan disesuaikan.");
                  }
              } else {
                  await ctx.reply("❌ Transaksi belum masuk ke Digiflazz atau terjadi masalah (Pesan: " + (json?.message || 'Error') + ").");
                  if (tx.status === 'Pending') {
                      await processDigiflazzWebhookData({
                          ref_id: tx.id,
                          status: 'Gagal',
                          message: json?.message || 'Transaksi Gagal (No Data)'
                      });
                      await ctx.reply("Sistem otomatis membatalkan transaksi dan mengembalikan saldo!");
                  }
              }
          } catch (e) {
              await ctx.reply("❌ Terjadi kesalahan jaringan saat mengecek: " + e.message);
          }
      });
`;

code = code.replace(
    '      bot.hears(/Cek Tagihan/i, async (ctx) => {',
    cekTrxCode + '\n      bot.hears(/Cek Tagihan/i, async (ctx) => {'
);

fs.writeFileSync('server.ts', code);
