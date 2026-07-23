const db = require('./db.json');
const t = db.transactions[0];
console.log(t.waJid, t.waMsgKey);
