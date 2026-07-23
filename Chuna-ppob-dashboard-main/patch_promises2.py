import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_async(match):
    inner = match.group(0)
    return "(async () => {\n" + inner + "\n})();"

# I'll just use regex to wrap the webhook try-catch in async IIFE
if "if (bot && tx.tgChatId && tx.tgMsgId) {\n                    try {" in content:
    content = content.replace("if (bot && tx.tgChatId && tx.tgMsgId) {\n                    try {", "if (bot && tx.tgChatId && tx.tgMsgId) {\n                    (async () => {\n                    try {")
    content = content.replace("} catch(err) {}\n                    }", "} catch(err) {}\n                    }\n                    })();")

if "} else if (bot && member && member.telegram && member.telegram.length > 0) {\n                    try {" in content:
    content = content.replace("} else if (bot && member && member.telegram && member.telegram.length > 0) {\n                    try {", "} else if (bot && member && member.telegram && member.telegram.length > 0) {\n                    (async () => {\n                    try {")
    content = content.replace("} catch (e) { console.error(\"Error in prepaidBrands check:\", e.message); }\n                }", "} catch (e) { console.error(\"Error in prepaidBrands check:\", e.message); }\n                    })();\n                }")

if "if (waSocket && tx.waJid && tx.waMsgKey) {\n                    try {" in content:
    content = content.replace("if (waSocket && tx.waJid && tx.waMsgKey) {\n                    try {", "if (waSocket && tx.waJid && tx.waMsgKey) {\n                    (async () => {\n                    try {")
    content = content.replace("} catch (e) { console.error(\"Error in prepaidBrands check:\", e.message); }\n                    }", "} catch (e) { console.error(\"Error in prepaidBrands check:\", e.message); }\n                    }\n                    })();")

if "} else if (waSocket && member && member.whatsapp) {\n                    let cleanWa" in content:
    content = content.replace("} else if (waSocket && member && member.whatsapp) {\n                    let cleanWa", "} else if (waSocket && member && member.whatsapp) {\n                    (async () => {\n                    let cleanWa")
    content = content.replace("} catch (err) {}\n                }", "} catch (err) {}\n                    })();\n                }")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched correctly")
