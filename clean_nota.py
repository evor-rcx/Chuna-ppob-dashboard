with open('server.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.strip() == 'app.get("/api/tagihan-nota", (req, res) => {':
        skip = True
    elif line.strip() == 'app.post("/api/login", (req, res) => {':
        skip = False
        new_lines.append("""app.get("/api/tagihan-nota", (req, res) => {
    try {
        const dataStr = Buffer.from(req.query.data as string, 'base64').toString('utf-8');
        const data = JSON.parse(dataStr);
        
        const txDate = new Date();
        const dateStr = txDate.toLocaleString('en-GB', { timeZone: 'Asia/Makassar', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
        const formattedDate = `${dateStr} WITA`;
        const calendarInfo = getCalendarInfo(txDate);
        
        let html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Tagihan - E4 STORE</title>
    <style>
        body { background-color: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; font-family: 'Courier Prime', monospace; }
        .receipt-container { background-color: transparent; width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 20px; }
        img { width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .btn-print { background-color: #0ea5e9; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s; }
        .btn-print:hover { background-color: #0284c7; }
        @media print {
            body { background-color: white; padding: 0; }
            .receipt-container { max-width: 100%; width: 100%; }
            img { box-shadow: none; border-radius: 0; width: 100%; max-width: 600px; }
            .btn-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <img src="/api/tagihan-nota-image?data=${req.query.data}" alt="Nota Pembelian" />
        <button class="btn-print" onclick="window.print()">🖨️ Cetak Struk</button>
    </div>
</body>
</html>`;
        res.send(html);
    } catch (e) {
        res.status(500).send("Error parsing tagihan data");
    }
});

app.get("/api/tagihan-nota-image", async (req, res) => {
    try {
        const dataStr = Buffer.from(req.query.data as string, 'base64').toString('utf-8');
        const data = JSON.parse(dataStr);
        const buffer = await generateCanvasReceipt("tagihan", data);
        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(500).send("Gagal generate gambar tagihan");
        }
    } catch (e) {
        res.status(500).send("Error parsing tagihan data for image");
    }
});

app.get("/api/nota/:id/image", async (req, res) => {
    const { id } = req.params;
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).send("Nota tidak ditemukan.");
    }
    const buffer = await generateCanvasReceipt("nota", tx);
    if (buffer) {
        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
    } else {
        res.status(500).send("Gagal generate gambar");
    }
});

app.get("/api/nota/:id", (req, res) => {
    const { id } = req.params;
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).send("Nota tidak ditemukan.");
    }
    
    let html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk - E4 STORE</title>
    <style>
        body { background-color: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
        .receipt-container { background-color: transparent; width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 20px; }
        img { width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .btn-print { background-color: #0ea5e9; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s; }
        .btn-print:hover { background-color: #0284c7; }
        @media print {
            body { background-color: white; padding: 0; }
            .receipt-container { max-width: 100%; width: 100%; }
            img { box-shadow: none; border-radius: 0; width: 100%; max-width: 600px; }
            .btn-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <img src="/api/nota/${id}/image" alt="Nota Pembelian" />
        <button class="btn-print" onclick="window.print()">🖨️ Cetak Struk</button>
    </div>
</body>
</html>`;

    res.send(html);
});

""")
    
    if not skip:
        new_lines.append(line)

with open('server.ts', 'w') as f:
    f.writelines(new_lines)
print("done")
