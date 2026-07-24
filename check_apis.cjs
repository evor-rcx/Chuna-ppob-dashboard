const fs = require('fs');

const srcFiles = [
    'src/components/Sidebar.tsx',
    'src/components/views/KasirFisik.tsx',
    'src/components/views/Transaksi.tsx',
    'src/components/views/Bot.tsx',
    'src/components/views/Produk.tsx',
    'src/components/views/MemberOffline.tsx',
    'src/components/views/Saldo.tsx',
    'src/components/views/Ringkasan.tsx',
    'src/components/views/Konfig.tsx',
];

const apiRegex = /fetch\(['`"](\/api\/[^'`"?]+)/g;

const missingApis = new Set();
const serverCode = fs.readFileSync('server.ts', 'utf-8');

for (const file of srcFiles) {
    if (fs.existsSync(file)) {
        const code = fs.readFileSync(file, 'utf-8');
        let match;
        while ((match = apiRegex.exec(code)) !== null) {
            let endpoint = match[1];
            // Remove /:id dynamically replaced
            endpoint = endpoint.replace(/\/\${[^}]+}/g, '/:id');
            // Check if endpoint is in server.ts
            // we look for '/api/foo' in server.ts
            if (!serverCode.includes(endpoint)) {
                missingApis.add(endpoint);
            }
        }
    }
}

console.log("Missing APIs:", Array.from(missingApis));
