import re

with open('server.ts', 'r') as f:
    code = f.read()

gmail_code = """
  app.get("/api/gmail/status", (req, res) => {
    res.json({
      status: db.gmailEmail ? "Configured" : "Not Configured",
      email: db.gmailEmail || ""
    });
  });

  app.post("/api/gmail/configure", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and App Password are required" });
    
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email,
          pass: password
        }
      });
      
      // Verify connection
      await transporter.verify();
      
      db.gmailEmail = email;
      db.gmailAppPassword = password;
      writeDB(db);
      
      res.json({ success: true, message: "Gmail connected successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Failed to connect: " + error.message });
    }
  });
"""

code = code.replace('  app.post("/api/bot/configure",', gmail_code + '\n  app.post("/api/bot/configure",')

with open('server.ts', 'w') as f:
    f.write(code)
print("Updated server.ts with Gmail endpoints")
