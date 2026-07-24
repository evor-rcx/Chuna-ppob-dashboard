const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /\/\/ Helper to find URL recursively or in array[\s\S]*?let allUrls = extractUrls\(result\);/
const replace = `// Helper to find URL recursively or in array
                        const extractUrls = (res: any): string[] => {
                            if (!res) return [];
                            if (typeof res === 'string' && res.startsWith('http')) return [res];
                            if (Array.isArray(res)) return res.map(r => extractUrls(r)).flat();
                            if (typeof res === 'object') {
                                return Object.values(res).map(r => extractUrls(r)).flat();
                            }
                            return [];
                        };
                        
                        let allUrls = extractUrls(result);`;

if (code.match(regex)) {
   code = code.replace(regex, replace);
   fs.writeFileSync('server.ts', code);
   console.log("Fixed extractUrls.");
} else {
   console.log("Could not find regex.");
}
