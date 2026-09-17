const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(line => line.includes('waSocket.ev.on("messages.upsert"'));
console.log('Start index:', startIndex);

const slice = lines.slice(startIndex, startIndex + 30);
console.log(slice.join('\n'));
