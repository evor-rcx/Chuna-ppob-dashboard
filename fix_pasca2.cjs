const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';`,
`                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        }
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';`
);

fs.writeFileSync('server.ts', code);
