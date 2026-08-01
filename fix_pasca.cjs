const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`                db.members = members;
                writeDB(db);
            }
                const methodDisplay = method === 'cash'`,
`                db.members = members;
                writeDB(db);
            }
        }
                const methodDisplay = method === 'cash'`
);

fs.writeFileSync('server.ts', code);
