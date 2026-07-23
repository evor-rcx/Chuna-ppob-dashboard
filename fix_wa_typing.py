import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("""          await waSocket.sendPresenceUpdate('composing', jid);
          setTimeout(async () => {
             await waSocket?.sendPresenceUpdate('paused', jid);
             await waSocket?.sendMessage(jid, { text: msg });
          }, 1500);""", """          await waSocket.sendPresenceUpdate('composing', jid);
          await new Promise(r => setTimeout(r, 3000));
          await waSocket?.sendPresenceUpdate('paused', jid);
          await waSocket?.sendMessage(jid, { text: msg });""")

text = text.replace("""                        await waSocket.sendPresenceUpdate('composing', jid);
                        setTimeout(async () => {
                            await waSocket?.sendPresenceUpdate('paused', jid);
                            await waSocket?.sendMessage(jid, { text: replyText }); 
                        }, 2000);""", """                        await waSocket.sendPresenceUpdate('composing', jid);
                        await new Promise(r => setTimeout(r, 3000));
                        await waSocket?.sendPresenceUpdate('paused', jid);
                        await waSocket?.sendMessage(jid, { text: replyText });""")

text = text.replace("""                                 await waSocket.sendPresenceUpdate('composing', jid);
                                 setTimeout(async () => {
                                     await waSocket?.sendPresenceUpdate('paused', jid);
                                     await waSocket?.sendMessage(jid, { text: replyText.replace(/\\*/g, '*') }); // keep * for WA bold
                                 }, 2000);""", """                                 await waSocket.sendPresenceUpdate('composing', jid);
                                 await new Promise(r => setTimeout(r, 3000));
                                 await waSocket?.sendPresenceUpdate('paused', jid);
                                 await waSocket?.sendMessage(jid, { text: replyText.replace(/\\*/g, '*') }); // keep * for WA bold""")

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Replaced WA typing timeouts")
