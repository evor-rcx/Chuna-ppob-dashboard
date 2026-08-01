const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `           await transporter.sendMail({
             from: \`E4 Store <\${db.gmailEmail}>\`,
             to: member.gmail,
             subject: 'Selamat! Tipe Akun Anda Berubah',
             text: \`🎉 SELAMAT! STATUS AKUN KAKAK BERUBAH NIH! 🌟\\n\\nHalo kak \${member.name}! Chuna mau kasih tau kalau tipe akun kakak sekarang udah jadi \${type} loh! 🥳\\n\\nNikmati kemudahan bertransaksi dan pastinya makin untung belanja di E4 Store!\\nYuk cek produk dan katalog terbaru sekarang kak~ 🛍️✨\`
           });`;

const replacementStr = `           const htmlContent = \`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Akun E4 Store</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1e1e1e; padding: 30px 20px; }
    .header { text-align: center; padding-bottom: 25px; }
    .logo-text { font-size: 32px; font-weight: 900; color: #3b82f6; text-decoration: none; letter-spacing: 2px; font-style: italic; }
    .logo-text span { color: #f97316; }
    .success-banner { background-color: #064e3b; color: #34d399; padding: 16px 20px; border-radius: 12px; display: flex; align-items: center; margin-bottom: 30px; font-weight: 600; font-size: 16px; border: 1px solid #059669; }
    .success-icon { margin-right: 12px; font-size: 16px; background-color: #34d399; color: #064e3b; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; }
    .hero-image { width: 100%; border-radius: 16px; margin-bottom: 30px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); height: 160px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: bold; text-align: center; }
    .title { font-size: 26px; font-weight: 800; margin-bottom: 20px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { font-size: 16px; line-height: 1.7; color: #d1d5db; }
    .content p { margin-bottom: 16px; }
    .highlight { color: #34d399; font-weight: 700; font-size: 18px; }
    .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #374151; padding-top: 25px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">E<span>4</span> STORE</div>
    </div>
    <div class="success-banner">
      <span class="success-icon">✓</span> Status Akun Berhasil Diupdate!
    </div>
    <div class="hero-image">
      🎉 🥳 ✨
    </div>
    <div class="title">
      Hai, \${(member.name || 'Kakak').toUpperCase()}
    </div>
    <div class="content">
      <p>Terima kasih udah setia bertransaksi di E4 Store! Kami punya kabar gembira buat kamu nih.</p>
      <p>Mulai hari ini, tipe akun kamu resmi di-upgrade menjadi <span class="highlight">\${type}</span>! 🌟</p>
      <p>Dengan status akun yang baru, kamu bisa menikmati kemudahan bertransaksi yang lebih baik dan pastinya makin untung belanja di E4 Store.</p>
      <p>Yuk, cek produk dan katalog terbaru sekarang juga! 🛍️✨</p>
    </div>
    <div class="footer">
      &copy; \${new Date().getFullYear()} E4 Store Official. Hak cipta dilindungi.
    </div>
  </div>
</body>
</html>\`;

           await transporter.sendMail({
             from: \`E4 Store <\${db.gmailEmail}>\`,
             to: member.gmail,
             subject: 'Selamat! Tipe Akun Anda Berubah 🎉',
             html: htmlContent
           });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('server.ts', code);
  console.log("Patched email html successfully");
} else {
  console.log("Could not find target string for email html.");
}
