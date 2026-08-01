const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    waSocket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: logger as any,
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: false
    });`;

const replacementStr = `    waSocket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: logger as any,
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    const originalWaSendMessage = waSocket.sendMessage.bind(waSocket);
    waSocket.sendMessage = async (jid, content, options) => {
        if (jid && !jid.includes('status@broadcast')) {
            try {
                await waSocket.presenceSubscribe(jid);
                await waSocket.sendPresenceUpdate('composing', jid);
                await new Promise(r => setTimeout(r, 1500));
                await waSocket.sendPresenceUpdate('paused', jid);
            } catch(e) {}
        }
        return originalWaSendMessage(jid, content, options);
    };`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
