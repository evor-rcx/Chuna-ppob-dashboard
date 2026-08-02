const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                                if (status === 'Sukses' || status === 'Gagal') {`;
const insert = `
                if (status === 'Sukses' && member && member.gmail && db.gmailEmail && db.gmailAppPassword) {
                    (async () => {
                        try {
                            const buffer = await generateCanvasReceipt("nota", tx);
                            if (buffer) {
                                const transporter = (await import('nodemailer')).default.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: db.gmailEmail,
                                        pass: db.gmailAppPassword
                                    }
                                });
                                
                                const htmlContent = \`<!DOCTYPE html>
<html lang="id">
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #121212; color: #ffffff; padding: 20px; }
    .container { max-width: 600px; margin: auto; background-color: #1e1e1e; padding: 20px; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="color: #34d399;">Transaksi Berhasil!</h2>
    <p>Halo kak \${member.name || tx.target},</p>
    <p>Pesanan kamu sudah kami proses. Berikut nota pembeliannya.</p>
    <p>Terima kasih sudah berbelanja di E4 Store! 🥰</p>
  </div>
</body>
</html>\`;

                                await transporter.sendMail({
                                    from: \`E4 Store <\${db.gmailEmail}>\`,
                                    to: member.gmail,
                                    subject: \`Nota Pembelian Berhasil - E4 Store\`,
                                    html: htmlContent,
                                    attachments: [{
                                        filename: 'nota.jpg',
                                        content: buffer
                                    }]
                                });
                            }
                        } catch (e) {
                            console.log("Failed to send receipt to gmail:", e);
                        }
                    })();
                }
`;

code = code.replace(target, insert + target);
fs.writeFileSync('server.ts', code);
