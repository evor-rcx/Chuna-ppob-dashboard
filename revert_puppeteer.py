import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove puppeteer imports and helper
puppeteer_block = """import puppeteer from 'puppeteer';
import { execSync } from 'child_process';

let browserInstance: any = null;

async function getBrowser() {
    if (browserInstance) return browserInstance;
    if (!fs.existsSync('/tmp/chrome')) {
        try {
            execSync('cp -r /root/.cache/puppeteer/chrome /tmp/chrome && chmod -R +x /tmp/chrome');
        } catch(e) {
            console.error("Failed to copy chrome to /tmp:", e);
        }
    }
    try {
        const execPath = await puppeteer.executablePath();
        const finalPath = execPath.replace('/root/.cache/puppeteer/chrome', '/tmp/chrome');
        browserInstance = await puppeteer.launch({
            executablePath: finalPath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
    } catch(e) {
        console.error("Puppeteer launch failed:", e);
    }
    return browserInstance;
}

async function renderUrlToImage(url: string): Promise<Buffer | null> {
    const browser = await getBrowser();
    if (!browser) return null;
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 600, height: 1200 });
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
        
        const element = await page.$('.parchment') || await page.$('.thermal-paper');
        let buffer;
        if (element) {
            buffer = await element.screenshot();
        } else {
            buffer = await page.screenshot({ fullPage: true });
        }
        await page.close();
        return Buffer.from(buffer);
    } catch(e) {
        console.error("Screenshot error:", e);
        return null;
    }
}
"""

content = content.replace("import puppeteer from 'puppeteer';\nimport { execSync } from 'child_process';\nimport fs from 'fs';\n\nlet browserInstance: any = null;\n\nasync function getBrowser() {\n    if (browserInstance) return browserInstance;\n    if (!fs.existsSync('/tmp/chrome')) {\n        try {\n            execSync('cp -r /root/.cache/puppeteer/chrome /tmp/chrome && chmod -R +x /tmp/chrome');\n        } catch(e) {\n            console.error(\"Failed to copy chrome to /tmp:\", e);\n        }\n    }\n    try {\n        const execPath = await puppeteer.executablePath();\n        const finalPath = execPath.replace('/root/.cache/puppeteer/chrome', '/tmp/chrome');\n        browserInstance = await puppeteer.launch({\n            executablePath: finalPath,\n            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']\n        });\n    } catch(e) {\n        console.error(\"Puppeteer launch failed:\", e);\n    }\n    return browserInstance;\n}\n\nasync function renderUrlToImage(url: string): Promise<Buffer | null> {\n    const browser = await getBrowser();\n    if (!browser) return null;\n    try {\n        const page = await browser.newPage();\n        await page.setViewport({ width: 600, height: 1200 });\n        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });\n        \n        const element = await page.$('.parchment') || await page.$('.thermal-paper');\n        let buffer;\n        if (element) {\n            buffer = await element.screenshot();\n        } else {\n            buffer = await page.screenshot({ fullPage: true });\n        }\n        await page.close();\n        return Buffer.from(buffer);\n    } catch(e) {\n        console.error(\"Screenshot error:\", e);\n        return null;\n    }\n}\n", "")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed puppeteer block")
