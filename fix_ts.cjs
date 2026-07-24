const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix 1: msgOpt typed as any in interval
code = code.replace(/let msgOpt = \{\};/g, 'let msgOpt: any = {};');

// Fix 2: ctx.message cast to any in bot.on media
code = code.replace(/if \(ctx\.message\.photo\) \{/g, `const msg = ctx.message as any;
              if (msg.photo) {`);
code = code.replace(/ctx\.message\.photo/g, 'msg.photo');
code = code.replace(/ctx\.message\.video/g, 'msg.video');
code = code.replace(/ctx\.message\.document/g, 'msg.document');
code = code.replace(/ctx\.message\.caption/g, 'msg.caption');

fs.writeFileSync('server.ts', code);
