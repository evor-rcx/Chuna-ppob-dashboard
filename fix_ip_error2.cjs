const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex1 = /if\s*\(waSocket\s*&&\s*db\.waAnnouncementTarget\)\s*\{\s*const\s*custName\s*=\s*ctx\.from\?\.first_name\s*\|\|\s*"Pelanggan";\s*const\s*ownerMsg\s*=\s*`🚨\s*INFO\s*PENTING\s*DARI\s*CHUNA!\s*🚨\\nIP\s*Digiflazz\s*tidak\s*dikenali!\\nPelanggan\s*mencoba\s*memesan\s*namun\s*gagal\s*karena\s*error\s*IP\.\\n👤\s*Pelanggan:\s*\$\{custName\}\s*\(\$\{omniFinalCustomerNo\}\)\\n📦\s*Produk:\s*\$\{state\.data\.product\.product_name\}\\n⚠️\s*Error:\s*\$\{errMsg\}\\n\\nSegera\s*cek\s*dan\s*update\s*whitelist\s*IP\s*di\s*dashboard\s*Digiflazz\s*Kakak!`;\s*waSocket\.sendMessage\(db\.waAnnouncementTarget,\s*\{\s*text:\s*ownerMsg\s*\}\)\.catch\(\(\)=>\{\}\);\s*\}/g;

const regex2 = /if\s*\(waSocket\s*&&\s*db\.waAnnouncementTarget\)\s*\{\s*const\s*custName\s*=\s*ctx\.from\?\.first_name\s*\|\|\s*"Pelanggan";\s*const\s*ownerMsg\s*=\s*`🚨\s*INFO\s*PENTING\s*DARI\s*CHUNA!\s*🚨\\nIP\s*Digiflazz\s*tidak\s*dikenali!\\nPelanggan\s*mencoba\s*memesan\s*namun\s*gagal\s*karena\s*error\s*IP\.\\n👤\s*Pelanggan:\s*\$\{custName\}\s*\(\$\{finalCustomerNoVal\}\)\\n📦\s*Produk:\s*\$\{state\.data\.product\.product_name\}\\n⚠️\s*Error:\s*\$\{errMsg\}\\n\\nSegera\s*cek\s*dan\s*update\s*whitelist\s*IP\s*di\s*dashboard\s*Digiflazz\s*Kakak!`;\s*waSocket\.sendMessage\(db\.waAnnouncementTarget,\s*\{\s*text:\s*ownerMsg\s*\}\)\.catch\(\(\)=>\{\}\);\s*\}/g;

const regex3 = /if\s*\(waSocket\s*&&\s*db\.waAnnouncementTarget\)\s*\{\s*const\s*custName\s*=\s*ctx\.from\?\.first_name\s*\|\|\s*"Pelanggan";\s*const\s*ownerMsg\s*=\s*`🚨\s*INFO\s*PENTING\s*DARI\s*CHUNA!\s*🚨\\nIP\s*Digiflazz\s*tidak\s*dikenali!\\nPelanggan\s*mencoba\s*memesan\s*namun\s*gagal\s*karena\s*error\s*IP\.\\n👤\s*Pelanggan:\s*\$\{custName\}\s*\(\$\{finalCustomerNo\}\)\\n📦\s*Produk:\s*\$\{product\.product_name\}\\n⚠️\s*Error:\s*\$\{errMsg\}\\n\\nSegera\s*cek\s*dan\s*update\s*whitelist\s*IP\s*di\s*dashboard\s*Digiflazz\s*Kakak!`;\s*waSocket\.sendMessage\(db\.waAnnouncementTarget,\s*\{\s*text:\s*ownerMsg\s*\}\)\.catch\(\(\)=>\{\}\);\s*\}/g;


code = code.replace(regex1, `const custName = ctx.from?.first_name || "Pelanggan";
                             const ownerMsg = \`🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP.\\n👤 Pelanggan: \${custName} (\${omniFinalCustomerNo})\\n📦 Produk: \${state.data.product.product_name}\\n⚠️ Error: \${errMsg}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!\`;
                             for (const ownerId of db.owners) {
                                 bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                             }`);

code = code.replace(regex2, `const custName = ctx.from?.first_name || "Pelanggan";
                             const ownerMsg = \`🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP.\\n👤 Pelanggan: \${custName} (\${finalCustomerNoVal})\\n📦 Produk: \${state.data.product.product_name}\\n⚠️ Error: \${errMsg}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!\`;
                             for (const ownerId of db.owners) {
                                 bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                             }`);

code = code.replace(regex3, `const custName = ctx.from?.first_name || "Pelanggan";
                             const ownerMsg = \`🚨 INFO PENTING DARI CHUNA! 🚨\\nIP Digiflazz tidak dikenali!\\nPelanggan mencoba memesan namun gagal karena error IP.\\n👤 Pelanggan: \${custName} (\${finalCustomerNo})\\n📦 Produk: \${product.product_name}\\n⚠️ Error: \${errMsg}\\n\\nSegera cek dan update whitelist IP di dashboard Digiflazz Kakak!\`;
                             for (const ownerId of db.owners) {
                                 bot.telegram.sendMessage(ownerId, ownerMsg).catch(()=>{});
                             }`);

fs.writeFileSync('server.ts', code);
console.log("Fixed IP error to Telegram only");
