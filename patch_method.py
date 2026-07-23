import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """    let token = tx.sn || '-';
    let namaPlg = '-';"""

new_logic = """    let methodDisplay = "SALDO";
    if (tx.method === 'cash') methodDisplay = "CASH (TUNAI)";
    else if (tx.method === 'utang') methodDisplay = "UTANG";
    else if (tx.method === 'saldo') methodDisplay = "SALDO";
    
    let token = tx.sn || '-';
    let namaPlg = '-';"""

content = content.replace(old_logic, new_logic)

old_html = """        <div class="vintage-box status-box">
            <div class="row-split">
                <span class="label">Status Transaksi:</span>
                <span class="val">${tx.status.toUpperCase()}</span>
            </div>
        </div>"""

new_html = """        <div class="vintage-box status-box">
            <div class="row-split">
                <span class="label">Status Transaksi:</span>
                <span class="val">${tx.status.toUpperCase()}</span>
            </div>
            <div class="row-split">
                <span class="label">Metode Bayar:</span>
                <span class="val">${methodDisplay}</span>
            </div>
        </div>"""

content = content.replace(old_html, new_html)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Payment method patched successfully.")
