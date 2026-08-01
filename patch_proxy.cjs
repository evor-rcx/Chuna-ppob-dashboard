const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `const app = express();

  // Cyber Security Measures (Anti-hacker, Anti-bot)`;

const replacementStr = `const app = express();
app.set('trust proxy', 1);

  // Cyber Security Measures (Anti-hacker, Anti-bot)`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
