const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /if \(result\.type === 'image'\) \{\s*result\.thumbnail = result\.images;\s*\} else \{\s*result\.video = \[result\.video\];\s*\}/;
const replace = `if (result.type === 'image') {
                                        result.thumbnail = result.images;
                                    } else {
                                        result.video = [result.video?.playAddr || result.video];
                                    }
                                    if (result.music?.playUrl) {
                                        result.audio = [result.music.playUrl];
                                    }`;

if (code.match(regex)) {
   code = code.replace(regex, replace);
   fs.writeFileSync('server.ts', code);
   console.log("Fixed playAddr mapping.");
} else {
   console.log("Could not find regex.");
}
