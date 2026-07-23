import re

with open("server.ts", "r") as f:
    content = f.read()

new_html = r"""
        const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cek Tagihan - E4 STORE</title>
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
            border: 2px solid #facc15;
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
            background-color: #fdf2f8; 
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            font-size: 13px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 15px;
        }
        .chuna-title { color: #db2777; font-weight: bold; margin-bottom: 5px; }
        
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
            <div class="subtitle">Cek Tagihan</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
            <span class="label">Waktu Cek</span>
            <span class="value">${formattedDate}</span>
        </div>
        <div class="row">
            <span class="label">Nama</span>
            <span class="value">${data.nama || '-'}</span>
        </div>
        <div class="row">
            <span class="label">ID Pelanggan</span>
            <span class="value">${data.no || '-'}</span>
        </div>
        <div class="row">
            <span class="label">Layanan</span>
            <span class="value">${data.layanan || '-'}</span>
        </div>
        
        ${data.detail ? `<div class="row"><span class="label">Detail</span><span class="value" style="font-size: 12px; font-weight: normal;">${data.detail.replace(/[💎⚡📄📅💡💳]/g, '').replace(/\n/g, '<br>')}</span></div>` : ''}
        
        <div class="total-box">
            <span class="total-label">TOTAL TAGIHAN</span>
            <span class="total-val">Rp ${data.total.toLocaleString('id-ID')}</span>
        </div>
        
        <div class="chuna-box">
            <div class="chuna-title">Silahkan Lanjutkan Pembayaran</div>
            <div>Screenshot halaman ini jika diperlukan.</div>
        </div>
        
    </div>
</body>
</html>`;
"""

regex = r"const html = `<!DOCTYPE html>[\s\S]*?</html>`;"
# Note there are two occurrences of this (one inside tagihan-nota, and one inside the second print HTML). We only want to replace the first one.
content = re.sub(regex, new_html, content, count=1)

with open("server.ts", "w") as f:
    f.write(content)

