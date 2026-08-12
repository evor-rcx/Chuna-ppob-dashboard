const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `const waStatus = tx.method === 'utang' ? "(TIDAK LUNAS)" : "(LUNAS)";
                              await waSocket.sendMessage(jid, { image: buffer, caption: \`✅ *Transaksi Berhasil \${waStatus}!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰\` });`;

// Replace at line 646 area (padding might be different)
code = code.replace(
    /await waSocket\.sendMessage\(jid, \{ image: buffer, caption: "✅ \*Transaksi Berhasil!\* Berikut nota pembelian kamu ya, kak\. Terima kasih sudah belanja di E4 Store! 🥰" \}\);/g,
    `const waStatus = tx.method === 'utang' ? "(TIDAK LUNAS)" : "(LUNAS)";
                                        await waSocket.sendMessage(jid, { image: buffer, caption: \`✅ *Transaksi Berhasil \${waStatus}!* Berikut nota pembelian kamu ya, kak. Terima kasih sudah belanja di E4 Store! 🥰\` });`
);

fs.writeFileSync('server.ts', code);
