const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
let lines = code.split('\n');
let depth = 0;
for(let i=0; i<lines.length; i++) {
  let l = lines[i];
  if(l.includes('async function startTelegramBot')) console.log(i+1, 'START function');
  if(l.includes('const processPrepaidPayment =')) console.log(i+1, 'START prepaid');
  if(l.includes('const processPascaPayment =')) console.log(i+1, 'START pasca');
  let open = (l.match(/\{/g) || []).length;
  let close = (l.match(/\}/g) || []).length;
  depth += open - close;
  if(i > 5300 && i < 5315) console.log(i+1, depth, l);
}
console.log('Final depth:', depth);
