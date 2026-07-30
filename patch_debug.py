with open('server.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if line.strip() == "const jid = msg.key.remoteJid;":
        new_lines.append(line)
        new_lines.append("            console.log('Received thank you word from:', jid, 'Message:', lowerText);\n")
    elif line.strip() == "if (tx && (tx.status === 'Sukses' || tx.status === 'Gagal' || tx.status === 'Sukses (Manual)') && !repliedThanks.has(tx.id)) {":
        new_lines.append("                console.log('Found tx:', tx?.id, 'status:', tx?.status, 'Already replied:', tx ? repliedThanks.has(tx.id) : false);\n")
        new_lines.append(line)
    else:
        new_lines.append(line)

with open('server.ts', 'w') as f:
    f.writelines(new_lines)

print("Added debug logs")
