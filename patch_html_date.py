import re

with open("server.ts", "r") as f:
    content = f.read()

# Replace txDate formats in /api/nota and /api/tagihan-nota
old_html_date = """        const txDate = new Date();
        const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString()} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')} WITA`;"""
new_html_date = """        const txDate = new Date();
        const dateStr = txDate.toLocaleString('en-GB', { timeZone: 'Asia/Makassar', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
        const formattedDate = `${dateStr} WITA`;
        const calendarInfo = getCalendarInfo(txDate);"""
content = content.replace(old_html_date, new_html_date)

old_html_date2 = """    const txDate = new Date(tx.date);
    const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString()} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')} WITA`;"""
new_html_date2 = """    const txDate = new Date(tx.date);
    const dateStr = txDate.toLocaleString('en-GB', { timeZone: 'Asia/Makassar', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
    const formattedDate = `${dateStr} WITA`;
    const calendarInfo = getCalendarInfo(txDate);"""
content = content.replace(old_html_date2, new_html_date2)

# Now inject it into the footer HTML
# For /api/tagihan-nota
content = content.replace('            <div style="margin-top:5px;">📅 Waktu Cek: ${formattedDate}</div>\n        </div>', '            <div style="margin-top:5px;">📅 Waktu Cek: ${formattedDate}</div>\n            <div style="margin-top:2px;">✨ ${calendarInfo}</div>\n        </div>')

# For /api/nota/:id
content = content.replace('            <div>📅 Cetak: ${formattedDate} | Kode: ${shortCode}</div>\n        </div>', '            <div>📅 Cetak: ${formattedDate} | Kode: ${shortCode}</div>\n            <div style="margin-top:2px;">✨ ${calendarInfo}</div>\n        </div>')

with open("server.ts", "w") as f:
    f.write(content)
