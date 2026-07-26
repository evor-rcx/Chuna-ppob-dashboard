const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `try { await bot.telegram.deleteWebhook({ drop_pending_updates: true }); } catch (e) {}
await bot.launch();`;

const newStr = `try { await bot.telegram.deleteWebhook({ drop_pending_updates: true }); } catch (e) {}
if (process.env.APPLET_ID || process.env.K_REVISION) {
    console.log("Skipping bot.launch() in AI Studio environment to prevent 409 Conflict with your local server.");
} else {
    await bot.launch();
}`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('server.ts', code);
    console.log("Patched bot.launch successfully!");
} else {
    console.log("Target string not found.");
}
