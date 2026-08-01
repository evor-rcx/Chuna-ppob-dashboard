const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      if (waSocket && waStatus.includes('Connected') && member.whatsapp) {
         let cleanWa = member.whatsapp.replace(/\\D/g, "");
         if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
         const jid = \`\${cleanWa}@s.whatsapp.net\`;
         try {
            await waSocket.sendMessage(jid, { text: msgText });
         } catch(e) {
            console.log('Failed to send type change notification to whatsapp:', e);
         }
      }`;

const replacementStr = `      if (waSocket && waStatus.includes('Connected') && member.whatsapp) {
         let cleanWa = member.whatsapp.replace(/\\D/g, "");
         if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
         const jid = \`\${cleanWa}@s.whatsapp.net\`;
         try {
            await waSocket.sendMessage(jid, { text: msgText });
         } catch(e) {
            console.log('Failed to send type change notification to whatsapp:', e);
         }
      }

      if (member.gmail && db.gmailEmail && db.gmailAppPassword) {
         try {
           const transporter = nodemailer.createTransport({
             service: 'gmail',
             auth: {
               user: db.gmailEmail,
               pass: db.gmailAppPassword
             }
           });
           await transporter.sendMail({
             from: \`E4 Store <\${db.gmailEmail}>\`,
             to: member.gmail,
             subject: 'Selamat! Tipe Akun Anda Berubah',
             text: \`🎉 SELAMAT! STATUS AKUN KAKAK BERUBAH NIH! 🌟\\n\\nHalo kak \${member.name}! Chuna mau kasih tau kalau tipe akun kakak sekarang udah jadi \${type} loh! 🥳\\n\\nNikmati kemudahan bertransaksi dan pastinya makin untung belanja di E4 Store!\\nYuk cek produk dan katalog terbaru sekarang kak~ 🛍️✨\`
           });
         } catch (e) {
           console.log('Failed to send type change notification to gmail:', e);
         }
      }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('server.ts', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find target string.");
}
