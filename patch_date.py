import re

with open("server.ts", "r") as f:
    content = f.read()

# Replace date generation in generateCanvasReceipt
old_date_gen = """        const txDate = new Date(data.date || new Date());
        const formattedDate = `${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth()+1).toString().padStart(2, '0')}/${txDate.getFullYear().toString()} ${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')} WITA`;"""
new_date_gen = """        const txDate = new Date(data.date || new Date());
        const dateStr = txDate.toLocaleString('en-GB', { timeZone: 'Asia/Makassar', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
        const formattedDate = `${dateStr} WITA`;
        const calendarInfo = getCalendarInfo(txDate);"""
if "toLocaleString('en-GB'" not in content:
    content = content.replace(old_date_gen, new_date_gen)

# Replace Cetak text in generateCanvasReceipt
old_cetak = """        ctx.fillText(`📅 Cetak: ${formattedDate} | Kode: ${shortCode}`, width / 2, y);
        
        // create smaller canvas if needed
        const finalCanvas = createCanvas(width, y + 50);"""
new_cetak = """        ctx.fillText(`📅 Cetak: ${formattedDate} | Kode: ${shortCode}`, width / 2, y);
        y += 25;
        ctx.fillText(`✨ ${calendarInfo}`, width / 2, y);
        
        // create smaller canvas if needed
        const finalCanvas = createCanvas(width, y + 50);"""
if "✨ ${calendarInfo}" not in content:
    content = content.replace(old_cetak, new_cetak)
    
with open("server.ts", "w") as f:
    f.write(content)
