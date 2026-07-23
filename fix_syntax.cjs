const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will write a simple parser to fix the IIFEs around line 1000-1100

// 1. Remove the trailing })(); around line 1045
code = code.replace(/\} catch \(err\) \{\}\n                    \}\n                    \}\)\(\);\n                \} else if \(bot/g, `} catch (err) {}\n                    }\n                } else if (bot`);

// 2. Remove the IIFE in the else if block
code = code.replace(/else if \(bot && member && member\.telegram && member\.telegram\.length > 0\) \{\n                    \(\async \(\) => \{\n                    try \{/g, `else if (bot && member && member.telegram && member.telegram.length > 0) {\n                    try {`);

// 3. Remove the trailing })(); in the else if block
code = code.replace(/writeDB\(db\);\n                        \}\n                    \} catch \(e\) \{\n                    \}\n                \}/g, `writeDB(db);\n                        }\n                    } catch (e) {\n                    }\n                }`);

fs.writeFileSync('server.ts', code);
console.log("Fixed syntax");
