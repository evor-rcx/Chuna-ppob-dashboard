const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const match = code.match(/async function startTelegramBot\([^)]*\)\s*\{([\s\S]*?)catch \(error: any\)/);
if (match) {
    const block = match[1];
    const openBraces = (block.match(/\{/g) || []).length;
    const closeBraces = (block.match(/\}/g) || []).length;
    console.log(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
} else {
    console.log("Could not find block");
}
