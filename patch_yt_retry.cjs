const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                const { youtube } = await import('btch-downloader');
                const data = await youtube(link);`;

const replacement = `                const { youtube } = await import('btch-downloader');
                let data = await youtube(link);
                for(let i=0; i<3; i++) {
                    if (data && data.status) break;
                    console.log("YT fetch failed, retrying...", data);
                    await new Promise(r => setTimeout(r, 2000));
                    data = await youtube(link);
                }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched yt retry successfully");
} else {
    console.log("Target not found!");
}
