const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const member = members\.find\(\(m:any\) => m\.id === memberId\);[\s\S]*?await ctx\.reply\(lunasText\);\n                  \}/;

const replacement = `const member = members.find((m:any) => m.id === memberId);
                  const nama = member ? (member.name || "-") : "-";
                  const wa = member ? (member.whatsapp || "-") : "-";
                  
                  let rincianProduk = "";
                  utangTx.forEach((t: any) => {
                      rincianProduk += \`\${t.product} Rp \${t.price.toLocaleString('id-ID')}\\n\`;
                  });

                  const datesUtang = [...new Set(utangTx.map((t: any) => {
                      const d = new Date(t.date);
                      return \`\${d.getDate()} \${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][d.getMonth()]} \${d.getFullYear()}\`;
                  }))].join(', ');
                  
                  const today = new Date();
                  const tglLunas = \`\${today.getDate()} \${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()]} \${today.getFullYear()}\`;
                  
                  let lunasText = "";

                  if (nominal >= totalDebt) {
                      const kembalian = nominal - totalDebt;
                      lunasText = \`✅ LUNAS TOTAL! 🎉
Halo Kak \${nama},
Dengan senang hati kami informasikan bahwa pembayaran utang kakak telah sukses dan lunas! Berikut detailnya ya:

📦 RINCIAN PRODUK
Nama Produk Harga
\${rincianProduk}
Total Utang Rp \${totalDebt.toLocaleString('id-ID')}

📅 TANGGAL UTANG : \${datesUtang}
📆 TANGGAL BAYAR : \${tglLunas}

💰 RINCIAN PEMBAYARAN
· Total Utang : Rp \${totalDebt.toLocaleString('id-ID')}
· Dibayarkan : Rp \${nominal.toLocaleString('id-ID')}
· Kembalian : Rp \${kembalian.toLocaleString('id-ID')} ✅

Status pesanan kakak sekarang: ✅ LUNAS

Terima kasih sudah percaya sama kami. Jangan lupa, Chuna - Asisten Imutmu siap bantu 24 jam! kalau ada yang mau ditanyain lagi ya, Kak 😊
Terimakasih telah berbelanja di E4 Store! ❤️ Semoga produknya bermanfaat dan kami tunggu kunjungan berikutnya!\`;
                      
                      await ctx.reply(lunasText);
                  } else {
                      const sisa = totalDebt - nominal;
                      lunasText = \`⚠️ PEMBAYARAN SEBAGIAN
Halo Kak \${nama},
Pembayaran utang kakak telah kami terima sebagian.

📦 RINCIAN PRODUK
Nama Produk Harga
\${rincianProduk}
Total Utang Rp \${totalDebt.toLocaleString('id-ID')}

📅 TANGGAL UTANG : \${datesUtang}
📆 TANGGAL BAYAR : \${tglLunas}

💰 RINCIAN PEMBAYARAN
· Total Utang : Rp \${totalDebt.toLocaleString('id-ID')}
· Dibayarkan : Rp \${nominal.toLocaleString('id-ID')}
· Sisa Utang : Rp \${sisa.toLocaleString('id-ID')} ⚠️

Status pesanan kakak sekarang: ⚠️ BELUM LUNAS\`;
                      
                      await ctx.reply(lunasText);
                  }`;

code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
console.log("Utang text patched!");
