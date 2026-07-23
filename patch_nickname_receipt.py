import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target = "const targetNo = stateData.targetNo;"
replacement = """const targetNo = stateData.targetNo;
        const targetDisplay = stateData.nickname ? `${targetNo} (${stateData.nickname})` : targetNo;
"""
content = content.replace(target, replacement)

# Now replace instances of targetNo in processPrepaidPayment with targetDisplay
# Wait, I only want to replace it in the messages and the transaction history!
# Let's just do a targeted replace for the specific lines.

target2 = "🎯 Tujuan: ${targetNo} (${member.name || \"-\"})"
replacement2 = "🎯 Tujuan: ${targetDisplay} (${member.name || \"-\"})"
content = content.replace(target2, replacement2)

target3 = "ID Pelanggan: ${targetNo}\\nNama        : ${member.name || \"-\"}"
replacement3 = "ID Pelanggan: ${targetDisplay}\\nNama        : ${member.name || \"-\"}"
content = content.replace(target3, replacement3)

target4 = "target: targetNo,"
replacement4 = "target: targetDisplay,"
content = content.replace(target4, replacement4)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched receipt successfully")
