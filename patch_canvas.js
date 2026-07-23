const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace roundRect
code = code.replace(/ctx\.roundRect\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^\)]+)\);/g, `
            ctx.moveTo($1 + $5, $2);
            ctx.lineTo($1 + $3 - $5, $2);
            ctx.quadraticCurveTo($1 + $3, $2, $1 + $3, $2 + $5);
            ctx.lineTo($1 + $3, $2 + $4 - $5);
            ctx.quadraticCurveTo($1 + $3, $2 + $4, $1 + $3 - $5, $2 + $4);
            ctx.lineTo($1 + $5, $2 + $4);
            ctx.quadraticCurveTo($1, $2 + $4, $1, $2 + $4 - $5);
            ctx.lineTo($1, $2 + $5);
            ctx.quadraticCurveTo($1, $2, $1 + $5, $2);
`);

fs.writeFileSync('server.ts', code);
