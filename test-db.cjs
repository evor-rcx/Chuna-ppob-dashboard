const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const missingTg = db.transactions.filter(t => t.status === 'Pending' && !t.tgMsgId);
console.log("Pending without tgMsgId:", missingTg.length);
const allPending = db.transactions.filter(t => t.status === 'Pending');
console.log("Total Pending:", allPending.length);
