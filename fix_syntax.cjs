const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix the doubled if (!isOwnerSelf) { in Prepaid
code = code.replace(
`        if (!isOwnerSelf) {
            if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {`,
`        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {`
);

// Add missing closing brace in Prepaid
code = code.replace(
`                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
                const methodDisplay`,
`                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        }
        const methodDisplay`
);

// Fix missing if (!isOwnerSelf) { in Pasca
code = code.replace(
`        const customerNo = stateData.targetNo || stateData.customerNo || stateData.checkResult?.customer_no || "-";
        
        if (method === 'saldo') {
                if (member.balance < total) {`,
`        const customerNo = stateData.targetNo || stateData.customerNo || stateData.checkResult?.customer_no || "-";
        
        if (!isOwnerSelf) {
            if (method === 'saldo') {
                if (member.balance < total) {`
);

// Add missing closing brace in Pasca
code = code.replace(
`                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        
        const methodDisplay`,
`                member.balance -= total;
                db.members = members;
                writeDB(db);
            }
        }
        
        const methodDisplay`
);

fs.writeFileSync('server.ts', code);
