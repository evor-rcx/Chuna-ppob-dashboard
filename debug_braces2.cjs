const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
let lines = code.split('\n');
let depth = 0;
for(let i=0; i<lines.length; i++) {
  let l = lines[i];
  let open = (l.match(/\{/g) || []).length;
  let close = (l.match(/\}/g) || []).length;
  depth += open - close;
  if(i+1 === 2438) console.log(i+1, 'startTelegramBot', depth);
  if(i+1 === 2444) console.log(i+1, 'processPrepaidPayment', depth);
  if(i+1 === 2719) console.log(i+1, 'processPascaPayment', depth);
  if(i+1 === 5309) console.log(i+1, 'catch', depth);
}
