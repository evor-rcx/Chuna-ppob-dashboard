import re

with open("server.ts", "r") as f:
    content = f.read()

new_logic = r"""            let y = startY;
            const lines = [
                ['WAKTU CEK', formattedDate],
                ['NAMA', data.nama],
                ['ID PEL', data.target || data.no],
                ['LAYANAN', data.layanan],
                ['TOTAL', 'Rp ' + data.total.toLocaleString('id-ID')],
            ];
            
            for (const [label, val] of lines) {
                image.print(font32, leftColX, y, label);
                image.print(font32, midColX, y, ':');
                image.print(font32, rightColX, y, val);
                y += lineSpacing;
            }
            
            if (data.detail) {
                let cleanDetail = data.detail.replace(/[💎⚡📄📅💡💳]/g, '').replace(/\n/g, ', ');
                if (cleanDetail.length > 65) cleanDetail = cleanDetail.substring(0, 62) + '...';
                image.print(font32, leftColX, y + 20, 'DETAIL    : ' + cleanDetail.trim());
            }"""

regex = r"let y = startY;\s*const lines = \[\s*\['WAKTU CEK', formattedDate\],[\s\S]*?if \(data\.detail\) \{[\s\S]*?image\.print\(font32, leftColX, y \+ 20, 'DETAIL    : ' \+ cleanDetail\.trim\(\)\);\s*\}"

content = re.sub(regex, new_logic, content)

with open("server.ts", "w") as f:
    f.write(content)

