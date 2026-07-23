import re

with open("server.ts", "r") as f:
    content = f.read()

new_logic = r"""        if (type === 'nota') {
            printCenter(font32, "Struk " + (data.type === 'pasca' ? 'Pascabayar' : 'Prabayar'), 140);
            
            const txDate = new Date(data.date);
            const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString()} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')} WITA`;
            
            drawLine(y);
            y += 60;
            
            let token = data.sn || '-';
            let namaPlg = '';
            let golDaya = '';
            let kwh = '';
            
            if (data.sn && data.sn.includes('/')) {
                const parts = data.sn.split('/');
                token = parts[0];
                namaPlg = parts[1] || '';
                if (parts.length > 3) {
                    golDaya = `${parts[2]} / ${parts[3]}`;
                    kwh = parts[4] || '';
                } else {
                    golDaya = parts.slice(2).join(' / ');
                }
            }
            
            let memberName = data.memberId;
            try {
                // Try to find actual member name if possible, otherwise use ID.
                const members = JSON.parse(require('fs').readFileSync('db.json', 'utf-8')).members || [];
                const m = members.find((x:any) => x.id === data.memberId);
                if (m && m.name) memberName = m.name;
            } catch (e) {}

            const lines: [string, string][] = [
                ['No. Transaksi', data.id],
                ['Waktu', formattedDate],
                ['Nama', memberName],
                ['ID Pelanggan', data.target],
                ['Token / SN', token],
                ['Layanan', data.product]
            ];
            
            if (namaPlg) lines.push(['Nama Pelanggan', namaPlg]);
            if (golDaya) lines.push(['Gol. / Daya', golDaya]);
            if (kwh) lines.push(['Total KWH', kwh]);
            
            for (const [label, val] of lines) {
                printLeft(font32, label, y);
                let displayVal = val;
                if (displayVal.length > 25) displayVal = displayVal.substring(0, 22) + '...';
                printRight(font32, displayVal, y);
                y += 50;
            }
            
            y += 20;
            drawLine(y);
            y += 60;
            
            printLeft(font32, "TOTAL BAYAR", y);
            printRight(font32, 'Rp ' + (data.price || 0).toLocaleString('id-ID'), y);
            y += 60;
            
            printLeft(font32, "STATUS TRANSAKSI", y);
            printRight(font32, data.status.toUpperCase(), y);
            y += 60;
            
            drawLine(y);
            y += 60;
            
            printCenter(font32, "🐾 Chuna - Asisten Pintarmu siap membantu 24 jam!", y);
            printCenter(font32, "Terimakasih telah berbelanja di E4 Store!", y + 50);
            
        } else if (type === 'tagihan') {"""

regex = r"        if \(type === 'nota'\) \{.*?\} else if \(type === 'tagihan'\) \{"

content = re.sub(regex, new_logic, content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
