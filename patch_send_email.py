import re

with open('server.ts', 'r') as f:
    code = f.read()

send_email_code = """
  app.post("/api/nota/:id/send-email", async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: "Email tujuan diperlukan" });
    }
    
    if (!db.gmailEmail || !db.gmailAppPassword) {
      return res.status(400).json({ success: false, error: "Gmail belum dikonfigurasi di menu Bot" });
    }
    
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).json({ success: false, error: "Nota tidak ditemukan" });
    }
    
    try {
      const buffer = await generateCanvasReceipt("nota", tx);
      if (!buffer) {
          return res.status(500).json({ success: false, error: "Gagal generate gambar nota" });
      }
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: db.gmailEmail,
          pass: db.gmailAppPassword
        }
      });
      
      const mailOptions = {
        from: `E4 Store <${db.gmailEmail}>`,
        to: email,
        subject: `Nota Pembelian - ${tx.product}`,
        text: `Halo,\n\nTerima kasih telah berbelanja di E4 Store.\nBerikut adalah nota pembelian Anda untuk produk ${tx.product}.\n\nID Transaksi: ${tx.id}\nHarga: Rp ${tx.price.toLocaleString('id-ID')}\nStatus: ${tx.status}\n\nSalam,\nE4 Store`,
        attachments: [
          {
            filename: `Nota-${tx.id}.png`,
            content: buffer
          }
        ]
      };
      
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email berhasil dikirim!" });
    } catch (e: any) {
      console.error("Error sending email:", e);
      res.status(500).json({ success: false, error: "Gagal mengirim email: " + e.message });
    }
  });
"""

code = code.replace('  app.get("/api/nota/:id/image", async (req, res) => {', send_email_code + '\n  app.get("/api/nota/:id/image", async (req, res) => {')

with open('server.ts', 'w') as f:
    f.write(code)
    
print("server.ts updated with send-email endpoint")
