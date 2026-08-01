const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Webhook refund
code = code.replace(
    "if (status === 'Gagal' && tx.method === 'saldo') {",
    "if (status === 'Gagal' && tx.method === 'saldo' && !isOwnerSelf) {"
);

// 2. Prepaid deduction
code = code.replace(
`        if (method === 'saldo') {
                if (member.balance < total) {`,
`        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {`
);
// Add one closing brace
code = code.replace(
`                db.members = members;
                writeDB(db);
            }
        const methodDisplay`,
`                db.members = members;
                writeDB(db);
            }
        }
        const methodDisplay`
);

// 3. Prepaid instant fail refund
code = code.replace(
`                    if (method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    let refundMsg`,
`                    if (!isOwnerSelf && method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    let refundMsg`
);

// 4. Prepaid catch block refund
code = code.replace(
`                if (method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
                let refundMsg`,
`                if (!isOwnerSelf && method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
                let refundMsg`
);

// 5. Pasca deduction
code = code.replace(
`        if (method === 'saldo') {
                if (member.balance < total) {`,
`        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {`
);
// Add one closing brace
code = code.replace(
`                db.members = members;
                writeDB(db);
            }
        const methodDisplay`,
`                db.members = members;
                writeDB(db);
            }
        }
        const methodDisplay`
);

// 6. Pasca instant fail refund
code = code.replace(
`                    if (method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    let refundMsg`,
`                    if (!isOwnerSelf && method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }
                    let refundMsg`
);

// 7. Pasca catch block refund
code = code.replace(
`                if (method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
                let refundMsg`,
`                if (!isOwnerSelf && method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }
                let refundMsg`
);

fs.writeFileSync('server.ts', code);
