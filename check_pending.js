import fs from 'fs';
const db = JSON.parse(fs.readFileSync('db.json'));
const pending = db.transactions.filter(t => t.status === 'Pending');
console.log(`Found ${pending.length} pending transactions`);
console.log(pending);
