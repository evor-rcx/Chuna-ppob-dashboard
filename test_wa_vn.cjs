const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('./test_auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });
    
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if(connection === 'open') {
            console.log('Connected!');
            process.exit(0);
        }
    });
}
start();
