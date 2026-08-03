const fs = require('fs');
let code = fs.readFileSync('downloader.ts', 'utf8');

if (!code.includes('timeout: 10000')) {
    code = code.replace(/axios\.get\(shortUrl, \{/g, "axios.get(shortUrl, {\n            timeout: 10000,");
    code = code.replace(/axios\.get\(\`https\:\/\/www\.tikwm\.com\/api\/\?url=\$\{encodeURIComponent\(realUrl\)\}\`\);/g, "axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(realUrl)}`, { timeout: 15000 });");
    fs.writeFileSync('downloader.ts', code);
    console.log("Patched downloader");
}
