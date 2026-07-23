sed -i '126,140c\
                if (bot && tx.tgChatId && tx.tgMsgId) {\
                    try {\
                        await bot.telegram.sendChatAction(tx.tgChatId, "typing");\
                        await new Promise(r => setTimeout(r, 1500));\
                        await bot.telegram.editMessageText(tx.tgChatId, tx.tgMsgId, undefined, msg, { parse_mode: "Markdown" });\
                    } catch (e) {\
                        try {\
                            await bot.telegram.sendMessage(tx.tgChatId, msg, { parse_mode: "Markdown" });\
                        } catch(err) {}\
                    }\
                } else if (bot && member && member.telegram && member.telegram.length > 0) {\
                    try {\
                        await bot.telegram.sendMessage(member.telegram[0], msg, { parse_mode: "Markdown" });\
                    } catch (e) {}\
                }\
                if (waSocket && tx.waJid && tx.waMsgKey) {\
                    try {\
                        await waSocket.presenceSubscribe(tx.waJid);\
                        await waSocket.sendPresenceUpdate("composing", tx.waJid);\
                        await new Promise(r => setTimeout(r, 2000));\
                        await waSocket.sendPresenceUpdate("paused", tx.waJid);\
                        await waSocket.sendMessage(tx.waJid, { text: msg, edit: tx.waMsgKey });\
                    } catch (err) {\
                        try {\
                            await waSocket.sendMessage(tx.waJid, { text: msg });\
                        } catch (e) {}\
                    }\
                } else if (waSocket && member && member.whatsapp) {\
                    let cleanWa = member.whatsapp.replace(/\\D/g, "");\
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);\
                    const jid = cleanWa + "@s.whatsapp.net";\
                    try {\
                        await waSocket.presenceSubscribe(jid);\
                        await waSocket.sendPresenceUpdate("composing", jid);\
                        await new Promise(r => setTimeout(r, 2000));\
                        await waSocket.sendPresenceUpdate("paused", jid);\
                        await waSocket.sendMessage(jid, { text: msg });\
                    } catch (err) {}\
                }\
            }' server.ts
