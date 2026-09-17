const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replacements for the 3 locations
code = code.replace(/if \(waSocket && db\.waAnnouncementTarget\) \{\s*const custName = ctx\.from\?\.first_name \|\| "Pelanggan";\s*const ownerMsg = `🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP\.\\n👤 Pelanggan: \$\{custName\} \(\$\{omniFinalCustomerNo\}\)\\n📦 Produk: \$\{state\.data\.product\.product_name\}\\n⚠️ Error: \$\{errMsg\}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;\s*waSocket\.sendMessage\(db\.waAnnouncementTarget, \{ text: ownerMsg \}\)\.catch\(\(\)=>\{\}\);\s*\}/g,
`const custName = ctx.from?.first_name || "Pelanggan";
                             const ownerMsg = \`🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP.\\n👤 Pelanggan: \${custName} (\${omniFinalCustomerNo})\\n📦 Produk: \${state.data.product.product_name}\\n⚠️ Error: \${errMsg}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!\`;
                             for (const ownerId of db.owners) {
                                 bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                             }`);

code = code.replace(/if \(waSocket && db\.waAnnouncementTarget\) \{\s*const custName = ctx\.from\?\.first_name \|\| "Pelanggan";\s*const ownerMsg = `🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP\.\\n👤 Pelanggan: \$\{custName\} \(\$\{finalCustomerNoVal\}\)\\n📦 Produk: \$\{state\.data\.product\.product_name\}\\n⚠️ Error: \$\{errMsg\}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;\s*waSocket\.sendMessage\(db\.waAnnouncementTarget, \{ text: ownerMsg \}\)\.catch\(\(\)=>\{\}\);\s*\}/g,
`const custName = ctx.from?.first_name || "Pelanggan";
                             const ownerMsg = \`🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP.\\n👤 Pelanggan: \${custName} (\${finalCustomerNoVal})\\n📦 Produk: \${state.data.product.product_name}\\n⚠️ Error: \${errMsg}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!\`;
                             for (const ownerId of db.owners) {
                                 bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                             }`);

code = code.replace(/if \(waSocket && db\.waAnnouncementTarget\) \{\s*const custName = ctx\.from\?\.first_name \|\| "Pelanggan";\s*const ownerMsg = `🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP\.\\n👤 Pelanggan: \$\{custName\} \(\$\{finalCustomerNo\}\)\\n📦 Produk: \$\{product\.product_name\}\\n⚠️ Error: \$\{errMsg\}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;\s*waSocket\.sendMessage\(db\.waAnnouncementTarget, \{ text: ownerMsg \}\)\.catch\(\(\)=>\{\}\);\s*\}/g,
`const custName = ctx.from?.first_name || "Pelanggan";
                             const ownerMsg = \`🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP.\\n👤 Pelanggan: \${custName} (\${finalCustomerNo})\\n📦 Produk: \${product.product_name}\\n⚠️ Error: \${errMsg}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!\`;
                             for (const ownerId of db.owners) {
                                 bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                             }`);

fs.writeFileSync('server.ts', code);
console.log("Fixed IP error to Telegram only");
