const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const m = code.includes('/api/physical-transactions/:id/pay');
if (m) {
    console.log("PUT pay exists.");
} else {
    console.log("PUT pay missing.");
}
