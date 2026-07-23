const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the interval block
const intervalRegex = /setInterval\(async \(\) => \{[\s\S]*?\}, 60 \* 60 \* 1000\);/;
const intervalMatch = code.match(intervalRegex);

if (intervalMatch) {
    const intervalCode = intervalMatch[0];
    // Remove interval from its current place
    code = code.replace(intervalRegex, '');
    
    // Insert interval into startServer()
    code = code.replace(/async function startServer\(\) \{/, 'async function startServer() {\n' + intervalCode);
    
    fs.writeFileSync('server.ts', code);
    console.log("Moved interval into startServer()");
}
