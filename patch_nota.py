import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Add the /api/nota/:id endpoint before app.get("*")
route_code = """
  app.get("/api/nota/:id", (req, res) => {
    const { id } = req.params;
    const tx = transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).send("Nota tidak ditemukan.");
    }
    const member = members.find(m => m.id === tx.memberId);
    const nama = member ? (member.name || "-") : "-";
    
    const txDate = new Date(tx.date);
    const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString().substring(2)} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')}`;
    
    const isPasca = tx.type === "pasca";
    
    let html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Otomatis - E4 STORE</title>
    <style>
        body {
            background-color: #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
        }
        .status-msg {
            color: #2563eb;
            font-weight: bold;
            font-family: Arial, sans-serif;
            margin-bottom: 20px;
        }
        .thermal-paper {
            background-color: #fff;
            width: 300px;
            padding: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            color: #000000;
            font-size: 14px; 
            line-height: 1.2;
            -webkit-font-smoothing: none;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { 
            font-weight: 900 !important; 
            -webkit-text-stroke: 0.5px black; 
        } 
        .title { 
            font-size: 20px; 
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .line-dashed { border-top: 2px dashed #000; margin: 8px 0; }
        .line-solid { border-top: 2px solid #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 3px 0; vertical-align: top; word-wrap: break-word; }
        .col-label { width: 38%; font-weight: bold; }
        .col-colon { width: 5%; text-align: center; font-weight: bold; }
        .col-value { width: 57%; font-weight: bold; }
        @media print {
            body { 
                background: #fff; 
                padding: 0; 
                margin: 0; 
                align-items: flex-start; 
            }
            .no-print { display: none !important; }
            .thermal-paper {
                box-shadow: none;
                padding: 0;
                margin: 0;
                width: 100%;
                max-width: 100%;
                color: #000000 !important;
                filter: contrast(200%) grayscale(100%);
            }
            .thermal-paper td, .thermal-paper div {
                font-weight: 900 !important;
                color: #000000 !important;
            }
            @page { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="status-msg no-print">
        ⏳ Menyiapkan printer otomatis...
    </div>
    <div class="thermal-paper">
        <div class="text-center">
            <div class="title bold">E4 STORE</div>
            <div class="bold">Jl. Zamrud Dpn Zamrud 2 RT42</div>
            <div class="bold">WA: 6285169959218</div>
        </div>
        <div class="line-solid"></div>
        <div class="text-center bold">${isPasca ? 'STRUK PASCABAYAR' : 'STRUK PRABAYAR'}</div>
        <div class="line-solid"></div>

        <table>
            <tr><td class="col-label">TANGGAL</td><td class="col-colon">:</td><td class="col-value">${formattedDate}</td></tr>
            <tr><td class="col-label">ORDER ID</td><td class="col-colon">:</td><td class="col-value">${tx.id}</td></tr>
            ${isPasca ? `<tr><td class="col-label">LAYANAN</td><td class="col-colon">:</td><td class="col-value bold">${tx.product}</td></tr>` : ''}
            <tr><td class="col-label">${isPasca ? 'ID PLG' : 'TUJUAN'}</td><td class="col-colon">:</td><td class="col-value bold" style="font-size: 15px;">${tx.target}</td></tr>
            <tr><td class="col-label">NAMA</td><td class="col-colon">:</td><td class="col-value">${nama}</td></tr>
        </table>
        
        <div class="line-dashed"></div>

        ${!isPasca ? `
        <div>
            <div class="bold" style="font-size: 15px;">${tx.product}</div>
            <table>
                <tr>
                    <td style="width: 65%;">SN: ${tx.sn || '-'}</td>
                    <td style="width: 35%; text-align: right;" class="bold">${tx.price.toLocaleString('id-ID')}</td>
                </tr>
            </table>
        </div>
        ` : `
        <table>
            <tr>
                <td class="bold">TAGIHAN</td>
                <td class="text-right bold">${tx.price.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
                <td class="bold">SN</td>
                <td class="text-right bold">${tx.sn || '-'}</td>
            </tr>
        </table>
        `}

        <div class="line-solid"></div>

        <table>
            <tr>
                <td class="bold" style="font-size: 16px;">TOTAL BAYAR</td>
                <td class="bold text-right" style="font-size: 16px;">Rp ${tx.price.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
                <td class="bold">STATUS</td>
                <td class="text-right bold" style="font-size: 15px;">${tx.status.toUpperCase()} ${tx.status === 'Sukses' ? '(LUNAS)' : ''}</td>
            </tr>
        </table>

        <div class="line-dashed"></div>
        
        <div class="text-center bold" style="font-size: 12px; margin-top: 10px;">
            ${isPasca ? `STRUK INI ADALAH BUKTI<br>PEMBAYARAN YANG SAH<br>~ E4 STORE ~` : `TERIMAKASIH TELAH BERBELANJA<br>~ E4 STORE SIAP BANTU 24 JAM ~`}
        </div>
        <div style="height: 40px;"></div> 
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;

    res.send(html);
  });
"""

text = text.replace('  app.get("*", (req, res) => {', route_code + '\n  app.get("*", (req, res) => {')

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Nota endpoint added.")
