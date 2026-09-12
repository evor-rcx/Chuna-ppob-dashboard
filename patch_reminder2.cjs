const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const target = `    let sent = false;
        
    if (member.whatsapp && waSocket) {
      let cleanWa = member.whatsapp.replace(/\\D/g, '');
      if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
      const jid = \`\${cleanWa}@s.whatsapp.net\`;
      try {
        await waSocket.sendMessage(jid, { text: msg });
        sent = true;
      } catch (e) {
        console.error("Gagal mengirim WA reminder", e);
      }
    }
    
    if (!sent && member.telegram && bot) {
      try {
         await bot.telegram.sendMessage(member.telegram, msg);
         sent = true;
      } catch (e) {
         console.error("Gagal mengirim TG reminder", e);
      }
    }
    
    return sent;
  }`;

const replacement = `    let sent = false;
        
    if (member.whatsapp && waSocket) {
      let cleanWa = member.whatsapp.replace(/\\D/g, '');
      if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
      const jid = \`\${cleanWa}@s.whatsapp.net\`;
      try {
        await waSocket.sendMessage(jid, { text: msg });
        sent = true;
      } catch (e) {
        console.error("Gagal mengirim WA reminder", e);
      }
    }
    
    if (!sent && member.telegram && bot) {
      try {
         await bot.telegram.sendMessage(member.telegram, msg);
         sent = true;
      } catch (e) {
         console.error("Gagal mengirim TG reminder", e);
      }
    }
    
    if (sent) {
        const nowIso = new Date().toISOString();
        debtsToRemind.forEach((t: any) => {
            t.lastReminderSentAt = nowIso;
        });
    }

    return sent;
  }`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
console.log('Patched server.ts part 2');
