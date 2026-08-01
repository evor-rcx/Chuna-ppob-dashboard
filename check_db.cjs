const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

console.log("Registered Users count:", Object.keys(db.registeredUsers || {}).length);
console.log("Members count:", (db.members || []).length);
console.log("Keys in registeredUsers:", Object.keys(db.registeredUsers || {}));
