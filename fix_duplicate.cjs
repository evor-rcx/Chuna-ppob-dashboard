const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
let idx = code.indexOf('import fs from "fs";', 10);
if (idx !== -1) {
    code = code.substring(0, idx);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed duplication");
} else {
    console.log("No duplication found");
}
