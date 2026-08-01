const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const dumpCode = `  app.get("/api/dump", (req, res) => {
    res.json({ registeredUsers, dbRegistered: db.registeredUsers });
  });`;

if (!code.includes('/api/dump')) {
    code = code.replace('const app = express();', 'const app = express();\n' + dumpCode);
    fs.writeFileSync('server.ts', code);
}
