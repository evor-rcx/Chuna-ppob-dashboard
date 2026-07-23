import re

with open("server.ts", "r") as f:
    content = f.read()

target = """                if (bot && tx.tgChatId && tx.tgMsgId) {
                    (async () => {
                    try {
                        await bot.telegram.sendChatAction(tx.tgChatId, "typing");
                        await new Promise(r => setTimeout(r, 1500));
                        await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" });
                    } catch (e) {
                        try {
                            await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" });
                        } catch(err) {}
                    }
                    })();
                } else if (bot && member && member.telegram && member.telegram.length > 0) {
                    (async () => {
                    try {
                        const tgId = Array.isArray(member.telegram) ? member.telegram[0] : member.telegram.replace(/\D/g, '');
                        await bot.telegram.sendMessage(tgId, msg, { parse_mode: "Markdown" });
                    } catch (e: any) { console.error("Error in prepaidBrands check:", e.message); }
                    })();
                }"""

replacement = """                if (bot && tx.tgChatId && tx.tgMsgId) {
                    (async () => {
                    try {
                        await bot.telegram.sendChatAction(tx.tgChatId, "typing");
                        await new Promise(r => setTimeout(r, 1500));
                        let tgPhotoSent = false;
                        if (status === 'Sukses') {
                            const appUrl = "http://localhost:3000";
                            const buffer = await renderUrlToImage(`${appUrl}/api/nota/${ref_id}`);
                            if (buffer) {
                                try { await bot.telegram.deleteMessage(tx.tgChatId, tx.tgMsgId); } catch(e) {}
                                await bot.telegram.sendPhoto(tx.tgChatId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            try {
                                await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" });
                            } catch (e) {
                                try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                            }
                        }
                    } catch (e) {
                        try { await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" }); } catch(err) {}
                    }
                    })();
                } else if (bot && member && member.telegram && member.telegram.length > 0) {
                    (async () => {
                    try {
                        const tgId = Array.isArray(member.telegram) ? member.telegram[0] : member.telegram.replace(/\D/g, '');
                        let tgPhotoSent = false;
                        if (status === 'Sukses') {
                            const appUrl = "http://localhost:3000";
                            const buffer = await renderUrlToImage(`${appUrl}/api/nota/${ref_id}`);
                            if (buffer) {
                                await bot.telegram.sendPhoto(tgId, { source: buffer }, { caption: msg, parse_mode: "Markdown" });
                                tgPhotoSent = true;
                            }
                        }
                        if (!tgPhotoSent) {
                            await bot.telegram.sendMessage(tgId, msg, { parse_mode: "Markdown" });
                        }
                    } catch (e: any) { console.error("Error in prepaidBrands check:", e.message); }
                    })();
                }"""

if target in content:
    content = content.replace(target, replacement)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Patched Webhook Telegram Image")
else:
    print("Target not found!")
