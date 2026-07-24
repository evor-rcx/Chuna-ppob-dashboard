const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
const match = code.includes('welcome.ogg');
console.log("Includes welcome.ogg:", match);
