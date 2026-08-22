import fs from 'fs';
const db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
const rezaTx = db.transactions.find(t => t.method === 'utang' && t.username === 'Reza');
const ikkyTx = db.transactions.find(t => t.method === 'utang' && t.username === 'Ikky');

console.log("Reza member:", db.members.find(m => m.id === rezaTx?.memberId));
console.log("Ikky member:", db.members.find(m => m.id === ikkyTx?.memberId));
