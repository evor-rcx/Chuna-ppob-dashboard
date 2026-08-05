const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `const fetch = require('node-fetch') || global.fetch;
                                const response = await fetch(videoUrl);
                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);`;

const target1_replace = `const axios = require('axios');
                                const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data);`;

code = code.replace(target1, target1_replace);

const target2 = `const fetch = require('node-fetch') || global.fetch;
                                const response = await fetch(audioUrl);
                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);`;

const target2_replace = `const axios = require('axios');
                                const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data);`;

code = code.replace(target2, target2_replace);

const target3 = `const fetch = require('node-fetch') || global.fetch;
                                const response = await fetch(data.mp4);
                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);`;

const target3_replace = `const axios = require('axios');
                                const response = await axios.get(data.mp4, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data);`;

code = code.replace(target3, target3_replace);

const target4 = `const fetch = require('node-fetch') || global.fetch;
                                const response = await fetch(data.mp3);
                                const arrayBuffer = await response.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);`;

const target4_replace = `const axios = require('axios');
                                const response = await axios.get(data.mp3, { responseType: 'arraybuffer' });
                                const buffer = Buffer.from(response.data);`;

code = code.replace(target4, target4_replace);

fs.writeFileSync('server.ts', code);
console.log("Patched fetch with axios successfully");
