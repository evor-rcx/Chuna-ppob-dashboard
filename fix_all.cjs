const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /const extractUrls = \(res: any\): string\[\] => \{[\s\S]*?return urls\.flat\(\);\s*\};\s*/g;
const replace = `const extractUrls = (res: any): string[] => {
    if (!res) return [];
    if (typeof res === 'string' && res.startsWith('http')) return [res];
    if (Array.isArray(res)) return res.map(r => extractUrls(r)).flat();
    if (typeof res === 'object') {
        return Object.values(res).map(r => extractUrls(r)).flat();
    }
    return [];
};
`;

code = code.replace(regex, replace);
fs.writeFileSync('server.ts', code);
console.log("Fixed all extractUrls");
