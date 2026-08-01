const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `const app = express();
app.set('trust proxy', 1);`;

const replacementStr = `const app = express();
// Menggunakan filter IP internal untuk trust proxy agar aman dari spoofing X-Forwarded-For
app.set('trust proxy', 'loopback, linklocal, uniquelocal');`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
