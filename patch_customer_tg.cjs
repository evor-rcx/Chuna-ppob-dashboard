const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `                  if (waSocket && member && member.whatsapp) {`;

const newStr = `                  if (member && member.telegram) {
                      const tgIds = Array.isArray(member.telegram) ? member.telegram : [member.telegram];
                      for (const tgId of tgIds) {
                          const cleanTgId = typeof tgId === 'string' ? tgId.replace(/[^0-9]/g, '') : String(tgId);
                          if (cleanTgId && cleanTgId !== String(ctx.from?.id)) {
                              try {
                                  await bot.telegram.sendMessage(cleanTgId, lunasText);
                              } catch(e) {
                                  console.error("Failed to send to customer tg", e);
                              }
                          }
                      }
                  }
                  
                  if (waSocket && member && member.whatsapp) {`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('server.ts', code);
console.log("Customer TG patched!");
