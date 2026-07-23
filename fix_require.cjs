const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/require\('path'\)\.join/g, 'path.join');
code = code.replace(/require\('fs'\)\.existsSync/g, 'fs.existsSync');

fs.writeFileSync('server.ts', code);
console.log("Fixed require calls in server.ts");
