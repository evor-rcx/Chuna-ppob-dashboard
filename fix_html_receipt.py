import re

with open("server.ts", "r") as f:
    content = f.read()

new_html = r"""
    let statusColor = '#4caf50';
    let statusIcon = '✅';
    if (tx.status.toLowerCase() === 'pending') {
        statusColor = '#f59e0b';
        statusIcon = '⏳';
    } else if (tx.status.toLowerCase() === 'gagal') {
        statusColor = '#ef4444';
        statusIcon = '❌';
    }
    
    let html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk - E4 STORE</title>
    <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #242424;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            font-family: 'Courier Prime', 'Courier New', monospace;
            color: #333;
        }
        .receipt-container {
            background-color: #fcfcfc;
            width: 100%;
            max-width: 380px;
            padding: 30px 20px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }
        .header { text-align: center; margin-bottom: 20px; }
        .logo-text { font-size: 22px; font-weight: 700; letter-spacing: 2px; margin-bottom: 5px; }
        .subtitle { font-size: 14px; color: #555; margin-bottom: 15px; }
        .status-badge {
            display: inline-block;
            background-color: ${statusColor};
            color: white;
            padding: 4px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }
        .divider {
            border-top: 2px dashed #333;
            margin: 15px 0;
        }
        .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
            line-height: 1.4;
        }
        .label {
            color: #555;
            white-space: nowrap;
            margin-right: 15px;
        }
        .value {
            font-weight: 700;
            text-align: right;
            word-break: break-word;
        }
        .total-box {
            border: 2px solid #facc15; /* Yellow border */
            border-radius: 8px;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: 700;
        }
        .total-box .total-label { color: #333; letter-spacing: 1px; }
        .total-box .total-val { color: #dc2626; font-size: 22px; }
        
        .chuna-box {
            background-color: #fdf2f8; /* very light pink/red */
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            font-size: 13px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 15px;
        }
        .chuna-title { color: #db2777; font-weight: bold; margin-bottom: 5px; }
        
        .footer {
            text-align: center;
            font-size: 11px;
            color: #777;
        }
        .squares { margin-bottom: 10px; letter-spacing: 10px; font-size: 10px; }
        
        @media print {
            body { background: #fff; padding: 0; }
            .receipt-container { box-shadow: none; width: 100%; max-width: 100%; padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <div class="logo-text">✦ E4 STORE OFFICIAL</div>
            <div class="subtitle">Struk ${isPasca ? 'Pascabayar' : 'Prabayar'}</div>
            <div class="status-badge">${statusIcon} ${tx.status.toUpperCase()}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
            <span class="label">No. Transaksi</span>
            <span class="value">${tx.id}</span>
        </div>
        <div class="row">
            <span class="label">Waktu</span>
            <span class="value">${formattedDate}</span>
        </div>
        <div class="row">
            <span class="label">Nama</span>
            <span class="value">${nama}</span>
        </div>
        <div class="row">
            <span class="label">ID Pelanggan</span>
            <span class="value">${tx.target}</span>
        </div>
        <div class="row">
            <span class="label">Token / SN</span>
            <span class="value">${token}</span>
        </div>
        <div class="row">
            <span class="label">Layanan</span>
            <span class="value">${tx.product}</span>
        </div>
        ${hasDetails ? `
        <div class="row">
            <span class="label">Nama Pelanggan</span>
            <span class="value">${namaPlg}</span>
        </div>
        <div class="row">
            <span class="label">Gol. / Daya</span>
            <span class="value">${golDaya}</span>
        </div>
        <div class="row">
            <span class="label">Total KWH</span>
            <span class="value">${kwh}</span>
        </div>
        ` : ''}
        
        <div class="total-box">
            <span class="total-label">TOTAL BAYAR</span>
            <span class="total-val">Rp ${tx.price.toLocaleString('id-ID')}</span>
        </div>
        
        <div class="row" style="margin-bottom: 20px;">
            <span class="label">Status Transaksi</span>
            <span class="value">${tx.status.toUpperCase()}</span>
        </div>
        
        <div class="chuna-box">
            <div class="chuna-title">🐾 Chuna - Asisten Pintarmu siap membantu 24 jam!</div>
            <div>Terimakasih telah berbelanja di E4 Store!</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
            <div class="squares">◻ ◻ ◻ ◻ ◻</div>
            <div>Cetak: ${formattedDate} | Kode: ${shortCode}</div>
        </div>
    </div>
</body>
</html>`;
"""

# Replace all of the /api/nota/:id html generation.
# Look for "let html = '';" inside "/api/nota/:id" and replace up to "res.send(html);"

regex = r"let html = '';[\s\S]*?res\.send\(html\);"

content = re.sub(regex, new_html + "\n    res.send(html);", content)

with open("server.ts", "w") as f:
    f.write(content)

