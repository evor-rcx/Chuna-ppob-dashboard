const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/await ctx\.replyWithPhoto\(\{ source: buffer \}\), \{ caption/g, 'await ctx.replyWithPhoto({ source: buffer }, { caption');

fs.writeFileSync('server.ts', code);
