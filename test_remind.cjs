const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
const rezaTx = db.transactions.find(t => t.method === 'utang' && t.username === 'Reza' || t.customer === 'Reza');
const ikkyTx = db.transactions.find(t => t.method === 'utang' && t.username === 'Ikky' || t.customer === 'Ikky');

console.log("Reza Tx memberId:", rezaTx?.memberId);
console.log("Reza member:", db.members.find(m => m.id === rezaTx?.memberId));
console.log("Ikky Tx memberId:", ikkyTx?.memberId);
console.log("Ikky member:", db.members.find(m => m.id === ikkyTx?.memberId));
