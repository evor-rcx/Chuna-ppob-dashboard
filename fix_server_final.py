import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove puppeteer import
content = re.sub(r"import puppeteer from 'puppeteer';\n", "", content)

# 2. Remove getBrowser and renderUrlToImage
content = re.sub(r"let browserInstance: any = null;\nasync function getBrowser\(\) \{[\s\S]*?\}\n\nasync function renderUrlToImage\([\s\S]*?\}\n", "", content)

# 3. Replace the usage of renderUrlToImage in processDigiflazzWebhookData
target_render = """                    try {
                         const buffer = await renderUrlToImage(notaUrl);
                         if (buffer) {
                             notaBuffer = buffer;
                         }
                    } catch(e) {
                         console.error("Screenshot failed:", e);
                    }"""
content = content.replace(target_render, "")

target_render2 = """                    try {
                         const buffer = await renderUrlToImage(notaUrl);
                         if (buffer) {
                             notaBuffer = buffer;
                         }
                    } catch(e) {
                         console.error("Screenshot failed:", e);
                    }"""
content = content.replace(target_render2, "")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed Puppeteer!")
