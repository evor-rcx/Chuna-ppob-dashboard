const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /\} \/\/ Only send the first video to avoid spamming multiple qualities\s*\} else if \(isAudio\)/g;
const replace = `} // Only send the first video to avoid spamming multiple qualities\n                                    else if (isAudio)`;

if (regex.test(code)) {
    code = code.replace(regex, replace);
    fs.writeFileSync('server.ts', code);
    console.log("Patched syntax!");
} else {
    console.log("Syntax regex not found!");
}
