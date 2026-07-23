const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
console.log("Tx count:", db.transactions ? db.transactions.length : 0);
