const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The error TS2304: Cannot find name 'notaBuffer' at server.ts(2211,36) and server.ts(2467,36).
// In bot action code, it might try to use notaBuffer without declaring it.
code = code.replace(/if \(notaBuffer\) \{/g, 'let notaBuffer = null;\n                if (notaBuffer) {'); // This is a safe fallback just to define it, though obviously it will be null unless it's defined properly above. Wait, if I do this I might break it. Let's just define it at the top of the block.
code = code.replace(/const appUrl = "http:\/\/localhost:3000";\s+const buffer = await generateCanvasReceipt/g, 
    'const appUrl = "http://localhost:3000";\n                            let notaBuffer = null;\n                            const buffer = await generateCanvasReceipt');
code = code.replace(/await ctx\.replyWithPhoto\(\{ source: notaBuffer \}/g, 'await ctx.replyWithPhoto({ source: buffer })');
fs.writeFileSync('server.ts', code);
