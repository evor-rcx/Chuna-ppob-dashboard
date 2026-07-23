const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
        console.log("Puppeteer works!");
        await browser.close();
    } catch (e) {
        console.error("Puppeteer failed:", e);
    }
})();
