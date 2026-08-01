const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Webhook refund
code = code.replace(
    "if (status === 'Gagal' && tx.method === 'saldo' && !isOwnerSelf) {",
    "if (status === 'Gagal' && tx.method === 'saldo') {"
);

// 2. Prepaid deduction
code = code.replace(
`        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {`,
`        if (method === 'saldo') {
                if (member.balance < total) {`
);
// Remove one closing brace
code = code.replace(
`                db.members = members;
                writeDB(db);
            }
        }`,
`                db.members = members;
                writeDB(db);
            }`
);

// 3. Prepaid instant fail refund
code = code.replace(
`                    if (!isOwnerSelf && method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }`,
`                    if (method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }`
);

// 4. Prepaid catch block refund
code = code.replace(
`                if (!isOwnerSelf && method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }`,
`                if (method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }`
);

// 5. Pasca deduction
code = code.replace(
`        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {`,
`        if (method === 'saldo') {
                if (member.balance < total) {`
);
// Remove one closing brace
code = code.replace(
`                db.members = members;
                writeDB(db);
            }
        }`,
`                db.members = members;
                writeDB(db);
            }`
);

// 6. Pasca instant fail refund
code = code.replace(
`                    if (!isOwnerSelf && method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }`,
`                    if (method === 'saldo') {
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }`
);

// 7. Pasca catch block refund
code = code.replace(
`                if (!isOwnerSelf && method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }`,
`                if (method === 'saldo') {
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }`
);

fs.writeFileSync('server.ts', code);
