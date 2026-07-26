const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the prepaid brands block
let p1 = code.indexOf('// Check prepaid brands');
let p2 = code.indexOf('// Check pasca brands', p1);
let p3 = code.indexOf('bot.on("photo"', p2);

console.log("Found indices:", p1, p2, p3);
