const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const btch = require\('btch-downloader'\);/g, "const btch = (await import('btch-downloader')).default || await import('btch-downloader');");
code = code.replace(/const ytSearch = require\('yt-search'\);/g, "const ytSearch = (await import('yt-search')).default || await import('yt-search');");
code = code.replace(/const axios = require\('axios'\);/g, "const axios = (await import('axios')).default || await import('axios');");

fs.writeFileSync('server.ts', code);
console.log("Replaced require calls!");
