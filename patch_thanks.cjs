const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                console.log('Found tx:', tx?.id, 'status:', tx?.status, 'Already replied:', tx ? repliedThanks.has(tx.id) : false);
                if (tx && (tx.status === 'Sukses' || tx.status === 'Gagal' || tx.status === 'Sukses (Manual)') && !repliedThanks.has(tx.id)) {
                    repliedThanks.add(tx.id);
                    
                    let customerName = msg.pushName || "Kakak";
                    if (member && member.name) {
                        customerName = member.name;
                    } else if (tx.target && !tx.target.match(/^\\d+$/)) {
                        customerName = tx.target;
                    }`;

const replacement = `                const isGroup = jid.endsWith('@g.us') || jid.endsWith('@newsletter');
                const replyKey = tx ? tx.id : jid + '_' + new Date().toDateString();
                console.log('Found tx:', tx?.id, 'status:', tx?.status, 'Already replied:', repliedThanks.has(replyKey));
                
                if (!isGroup && !repliedThanks.has(replyKey)) {
                    repliedThanks.add(replyKey);
                    
                    let customerName = msg.pushName || "Kakak";
                    if (member && member.name) {
                        customerName = member.name;
                    } else if (tx && tx.target && !tx.target.match(/^\\d+$/)) {
                        customerName = tx.target;
                    }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log('Patched thanks successfully');
} else {
    console.log('Target not found');
}
