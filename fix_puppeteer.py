import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace('import puppeteer from "puppeteer";\n', '')

old_get_browser = """async function getBrowser() {
    if (browserInstance) return browserInstance;
    try {
        browserInstance = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
    } catch(e) {
        console.error("Puppeteer launch failed:", e);
    }
    return browserInstance;
}"""

new_get_browser = """async function getBrowser() {
    if (browserInstance) return browserInstance;
    try {
        const puppeteer = (await import("puppeteer")).default;
        browserInstance = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
    } catch(e) {
        console.error("Puppeteer launch failed (is puppeteer installed?):", e.message);
    }
    return browserInstance;
}"""

if old_get_browser in content:
    content = content.replace(old_get_browser, new_get_browser)
    print("Replaced getBrowser")
else:
    print("Could not find getBrowser!")

with open("server.ts", "w") as f:
    f.write(content)
