const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace Telegram IIFE
code = code.replace(/if \(bot && tx\.tgChatId && tx\.tgMsgId\) \{\n                    \(\async \(\) => \{\n                    try \{/g, `if (bot && tx.tgChatId && tx.tgMsgId) {\n                    try {`);
code = code.replace(/\} catch \(e\) \{\n                    \}\n                    \}\)\(\);\n                \}/g, `} catch (e) {\n                    }\n                }`);

// Replace another Telegram IIFE variant (just in case)
code = code.replace(/if \(bot && tx\.tgChatId\) \{\n                    \(\async \(\) => \{\n                    try \{/g, `if (bot && tx.tgChatId) {\n                    try {`);

// Replace WA IIFE
code = code.replace(/if \(waSocket && member && member\.whatsapp\) \{\n                    \(\async \(\) => \{\n                    try \{/g, `if (waSocket && member && member.whatsapp) {\n                    try {`);
code = code.replace(/writeDB\(db\);\n                        \}\n                    \} catch \(e\) \{\n                        console\.error\("Failed to send WA webhook receipt", e\);\n                    \}\n                    \}\)\(\);\n                \}/g, `writeDB(db);\n                        }\n                    } catch (e) {\n                        console.error("Failed to send WA webhook receipt", e);\n                    }\n                }`);

// Just to make sure, let's also remove the IIFE endings that we might have missed
// We will do this carefully using regex.

fs.writeFileSync('server.ts', code);
console.log("Replaced IIFEs in processDigiflazzWebhookData");
