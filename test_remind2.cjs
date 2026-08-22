const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
console.log(db.transactions.filter(t => t.method === 'utang').map(t => ({ id: t.id, memberId: t.memberId })));
console.log(db.members);
