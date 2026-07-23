const fs = require('fs');
const dbFile = '/app/applet/db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
db.telegramToken = "8907328115:AAH99alE5YwJjBCxmYfuhxCo_8pHi_8RB1o";
fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log("Token updated successfully in db.json");
