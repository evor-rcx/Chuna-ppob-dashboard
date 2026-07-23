import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """    const isPasca = tx.type === "pasca";
    
    let token = tx.sn || '-';"""

new_logic = """    const isPasca = tx.type === "pasca";
    
    let stampText = "SUKSES<br>(LUNAS)";
    if (tx.status.toLowerCase() === 'pending') {
        stampText = "PENDING";
    } else if (tx.status.toLowerCase() === 'gagal') {
        stampText = "GAGAL";
    } else if (tx.method === 'utang' && tx.status === 'Sukses') {
        stampText = "TIDAK<br>LUNAS";
    }
    
    let token = tx.sn || '-';"""

content = content.replace(old_logic, new_logic)

old_html = """        <div class="wax-seal">
            <div class="wax-seal-inner">SUKSES<br>(LUNAS)</div>
        </div>"""

new_html = """        <div class="wax-seal">
            <div class="wax-seal-inner">${stampText}</div>
        </div>"""

content = content.replace(old_html, new_html)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Stamp patched successfully.")
