const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /const opusPath = path\.join\(process\.cwd\(\), "welcome\.opus"\);\s*if \(fs\.existsSync\(opusPath\)\) \{/g;
const replace = `let opusPath = path.join(process.cwd(), "welcome.ogg");
          if (!fs.existsSync(opusPath)) opusPath = path.join(process.cwd(), "welcome.opus");
          if (fs.existsSync(opusPath)) {`;

code = code.replace(regex, replace);

// Let's also patch the tiktok downloader to use tobyg74
const regexTiktok = /if \(url\.includes\('tiktok\.com'\)\) result = await btch\.ttdl\(url\);/g;
const replaceTiktok = `if (url.includes('tiktok.com')) {
                            try {
                                const { Downloader } = require('@tobyg74/tiktok-api-dl');
                                const tdl = await Downloader(url, { version: 'v1' });
                                if (tdl.status === 'success' && tdl.result) {
                                    result = tdl.result;
                                    // Map to btch format so it works seamlessly
                                    if (result.type === 'image') {
                                        result.thumbnail = result.images;
                                    } else {
                                        result.video = [result.video];
                                    }
                                } else {
                                    result = await btch.ttdl(url);
                                }
                            } catch(e) {
                                result = await btch.ttdl(url);
                            }
                        }`;
code = code.replace(regexTiktok, replaceTiktok);

fs.writeFileSync('server.ts', code);
