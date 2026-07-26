const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
for (let i = 4130; i < 4450; i++) {
    if (lines[i].includes('// Check')) {
        console.log(i + 1 + ':', lines[i].trim());
    }
}
