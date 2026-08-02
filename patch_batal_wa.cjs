const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const batalWaMsg = `
                    const sd = state.data || {};
                    const memberIdForPrepaid = sd.memberId || \`MBR-\${userId}\`;
                    const memberForPrepaid = members.find(m => m.id === memberIdForPrepaid);
                    if (waSocket && memberForPrepaid && memberForPrepaid.whatsapp) {
                        let cleanWa = memberForPrepaid.whatsapp.replace(/\\D/g, "");
                        if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                        const jid = cleanWa + "@s.whatsapp.net";
                        waSocket.sendMessage(jid, { text: "❌ Pembelian dibatalkan." }).catch(()=>{});
                    }
                    if (state.data?.memberId) {
`;

code = code.replace(/if \(text\.toLowerCase\(\) === 'batal' \|\| text === '❌ Batal' \|\| text === '❌ Tidak'\) \{\n                    if \(state\.data(?:\.)?memberId\)/g,
`if (text.toLowerCase() === 'batal' || text === '❌ Batal' || text === '❌ Tidak') {` + batalWaMsg);

fs.writeFileSync('server.ts', code);
