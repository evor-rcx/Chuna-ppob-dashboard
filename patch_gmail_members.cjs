const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `                  members.push({
                    id: \`MBR-\${userId}\`,
                    name: state.data.username,
                    whatsapp: state.data.wa,
                    telegram: \`ID:\${userId}\`,
                    balance: 0,
                    type: 'Biasa'
                  });`;

const replacementStr = `                  members.push({
                    id: \`MBR-\${userId}\`,
                    name: state.data.username,
                    whatsapp: state.data.wa,
                    telegram: \`ID:\${userId}\`,
                    balance: 0,
                    type: 'Biasa',
                    gmail: state.data.gmail
                  });`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
