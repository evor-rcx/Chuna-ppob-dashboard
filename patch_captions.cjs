const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace TikTok image caption
code = code.replace(/caption:\ i\ ===\ 0\ \?\ data\.title\ :\ undefined/g, "caption: i === 0 && data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined");

// Replace other TikTok & YT captions
code = code.replace(/caption:\ data\.title/g, "caption: data.title ? (data.title.length > 1000 ? data.title.substring(0, 1000) + '...' : data.title) : undefined");

// In the error, "message to edit not found" is also shown
// This is because we delete the message and then try to edit it when something fails?
// Oh wait:
// 0|chuna-store  |     at async <anonymous> (/media/devmon/sda-usb-hp_v210w_070D895/chuna-ppob-dashboard/server.ts:3547:13)
// 0|chuna-store  |     description: 'Bad Request: message to edit not found'
// 
// Let's check line 3547 (could be the global error catch)

fs.writeFileSync('server.ts', code);
console.log("Patched captions successfully");
