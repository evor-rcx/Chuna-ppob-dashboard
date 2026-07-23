const fs = require('fs');

const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk - E4 STORE</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Dancing+Script:wght@700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            background: #2a1610; /* Dark wood/leather color */
            background-image: radial-gradient(circle, #3d2314 0%, #1a0b05 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            font-family: 'Space Mono', monospace;
        }
        .parchment {
            background-color: #f3e5cd;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(139, 69, 19, 0.05) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(139, 69, 19, 0.05) 0%, transparent 20%);
            width: 380px;
            padding: 30px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6), inset 0 0 40px rgba(139, 69, 19, 0.15);
            position: relative;
            color: #3e2723;
            overflow: hidden;
            border: 1px solid #d7c4a1;
        }
        
        /* Torn edges effect using before/after */
        .parchment::before, .parchment::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            height: 10px;
            background-size: 20px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
            position: relative;
        }
        
        .logo-text {
            font-family: 'Dancing Script', cursive;
            font-size: 32px;
            color: #2c1a11;
            margin-bottom: -5px;
        }
        
        .store-name {
            font-family: 'Cinzel', serif;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        .struk-title {
            font-family: 'Cinzel', serif;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 15px;
        }
        
        .wax-seal {
            position: absolute;
            top: 20px;
            right: 10px;
            width: 70px;
            height: 70px;
            background: radial-gradient(circle at 30% 30%, #d32f2f, #8b0000);
            border-radius: 50%;
            box-shadow: 3px 3px 6px rgba(0,0,0,0.4), inset 2px 2px 4px rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-15deg);
            border: 1px solid #5c0000;
            z-index: 10;
        }
        
        .wax-seal-inner {
            border: 1px dotted #ffb3b3;
            border-radius: 50%;
            width: 58px;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            color: #ffdada;
            font-size: 11px;
            line-height: 1.1;
            text-shadow: 1px 1px 1px #4a0000;
        }
        
        .vintage-box {
            border: 2px solid #5d4037;
            border-radius: 8px;
            padding: 8px 10px;
            margin-bottom: 10px;
            position: relative;
            background: rgba(255,255,255,0.2);
            box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
        }
        
        /* Add inner border line */
        .vintage-box::before {
            content: '';
            position: absolute;
            top: 2px; left: 2px; right: 2px; bottom: 2px;
            border: 1px solid rgba(93, 64, 55, 0.4);
            border-radius: 5px;
            pointer-events: none;
        }
        
        .row-split {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 13px;
        }
        
        .row-split:last-child {
            margin-bottom: 0;
        }
        
        .label {
            font-weight: 400;
        }
        
        .val {
            font-weight: 700;
            text-align: right;
        }
        
        .box-pair {
            display: flex;
            gap: 6px;
            margin-bottom: 10px;
        }
        
        .box-left, .box-right {
            flex: 1;
            border: 2px solid #5d4037;
            border-radius: 8px;
            padding: 8px;
            position: relative;
            background: rgba(255,255,255,0.2);
            font-size: 12px;
            line-height: 1.6;
        }
        
        .box-left::before, .box-right::before {
            content: '';
            position: absolute;
            top: 2px; left: 2px; right: 2px; bottom: 2px;
            border: 1px solid rgba(93, 64, 55, 0.4);
            border-radius: 5px;
            pointer-events: none;
        }
        
        .box-right {
            text-align: right;
            font-weight: 700;
        }
        
        .sn-box {
            text-align: center;
        }
        
        .sn-title {
            font-size: 12px;
            margin-bottom: 2px;
        }
        
        .sn-value {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 1px;
        }
        
        .total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'Cinzel', serif;
            font-size: 18px;
            font-weight: 700;
            background: rgba(93, 64, 55, 0.1);
        }
        
        .status-box {
            font-size: 13px;
        }
        
        .footer-cursive {
            font-family: 'Dancing Script', cursive;
            font-size: 18px;
            text-align: center;
            margin-top: 20px;
            margin-bottom: 15px;
            color: #3e2723;
        }
        
        .footer-small {
            font-size: 10px;
            text-align: center;
            color: #5d4037;
        }
        
        @media print {
            body { 
                background: none;
                padding: 0;
            }
            .parchment {
                box-shadow: none;
                border: none;
                width: 100%;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="parchment">
        <div class="wax-seal">
            <div class="wax-seal-inner">SUKSES<br>(LUNAS)</div>
        </div>
        
        <div class="header">
            <div class="logo-text">E4 Official</div>
            <div class="store-name">E4 STORE OFFICIAL</div>
            <div class="struk-title">Struk Pascabayar</div>
        </div>
        
        <div class="vintage-box">
            <div class="row-split">
                <span class="label">No. Transaksi:</span>
                <span class="val">PRE-123456</span>
            </div>
            <div class="row-split">
                <span class="label">Waktu:</span>
                <span class="val">13/07/2026 17:25 WITA</span>
            </div>
        </div>
        
        <div class="box-pair">
            <div class="box-left">
                <div>Nama:</div>
                <div>ID Pelanggan:</div>
            </div>
            <div class="box-right">
                <div>Lili</div>
                <div>123456789</div>
            </div>
        </div>
        
        <div class="vintage-box sn-box">
            <div class="sn-title">TOKEN LISTRIK / SN:</div>
            <div class="sn-value">1976-6899-3137-4739-8027</div>
        </div>
        
        <div class="box-pair">
            <div class="box-left" style="flex: 0.3;">
                <div>Layanan:</div>
            </div>
            <div class="box-right" style="flex: 0.7;">
                <div>PLN Pascabayar (PLN 25.000)</div>
            </div>
        </div>
        
        <div class="box-pair">
            <div class="box-left">
                <div>Nama Pelanggan:</div>
                <div>Gol. / Daya:</div>
                <div>Total KWH:</div>
            </div>
            <div class="box-right">
                <div>RUSMAYANTY-3</div>
                <div>R1M / 900VA</div>
                <div>17.50KWH</div>
            </div>
        </div>
        
        <div class="vintage-box">
            <div class="row-split">
                <span class="label">Subtotal Layanan:</span>
                <span class="val">Rp 25.000</span>
            </div>
            <div class="row-split">
                <span class="label">Biaya Admin:</span>
                <span class="val">Rp 5.000</span>
            </div>
        </div>
        
        <div class="vintage-box total-box">
            <span>TOTAL BAYAR</span>
            <span>Rp 30.000</span>
        </div>
        
        <div class="vintage-box status-box">
            <div class="row-split">
                <span class="label">Status Transaksi:</span>
                <span class="val">SUKSES</span>
            </div>
        </div>
        
        <div class="footer-cursive">
            Chuna - Asisten Pintarmu siap membantu 24 jam!
        </div>
        
        <div class="footer-small">
            Terimakasih telah berbelanja di E4 Store!<br>
            Cetak: 13/07/2026 17:25 WITA | Kode: #PRE-12
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync('public/test_nota.html', html);
