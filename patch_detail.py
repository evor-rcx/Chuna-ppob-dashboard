with open('server.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "centerPrint(font32, 'Silahkan Lanjutkan Pembayaran'" in line:
        # insert before
        insert_text = """            if (data.detail) {
                let cleanDetail = data.detail.replace(/[💎⚡📄📅💡💳]/g, '').replace(/\\n/g, ', ');
                if (cleanDetail.length > 65) cleanDetail = cleanDetail.substring(0, 62) + '...';
                image.print(font32, leftColX, image.bitmap.height - 200, 'DETAIL    : ' + cleanDetail.trim());
            }
"""
        new_lines.insert(-1, insert_text)

with open('server.ts', 'w') as f:
    f.writelines(new_lines)

