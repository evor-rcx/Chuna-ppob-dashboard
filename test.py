import re

with open("server.ts", "r") as f:
    content = f.read()

new_logic = r"""            let y = startY;
            const lines = [
                ['TANGGAL', formattedDate],
                ['ORDER ID', data.id],
                ['LAYANAN', data.product],
                ['TUJUAN', data.target],
                ['METODE', data.method ? data.method.toUpperCase() : 'SALDO'],
                ['TOTAL', 'Rp ' + data.price.toLocaleString('id-ID')],
                ['STATUS', data.status.toUpperCase()],
            ];"""

regex = r"let y = startY;\s*const lines = \[\s*\['TANGGAL', formattedDate\],\s*\['ORDER ID', data\.id\],\s*\['LAYANAN', data\.product\],\s*\['TUJUAN', data\.target\],\s*\['HARGA', 'Rp ' \+ data\.price\.toLocaleString\('id-ID'\)\],\s*\['STATUS', data\.status\.toUpperCase\(\)\],\s*\];"

content = re.sub(regex, new_logic, content)

with open("server.ts", "w") as f:
    f.write(content)
