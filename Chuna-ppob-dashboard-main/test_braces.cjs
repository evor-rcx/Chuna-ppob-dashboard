const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const match = code.match(/bot\.on\("text", async \(ctx, next\) => \{([\s\S]*?)bot\.launch\(\)/);
if (match) {
    const block = match[1];
    const openBraces = (block.match(/\{/g) || []).length;
    const closeBraces = (block.match(/\}/g) || []).length;
    console.log(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
    
    // find try and catch
    const trys = (block.match(/try\s*\{/g) || []).length;
    const catches = (block.match(/catch\s*\(/g) || []).length;
    console.log(`Trys: ${trys}, Catches: ${catches}`);
}
