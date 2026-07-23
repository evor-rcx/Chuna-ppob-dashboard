import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('wa_auth');
    const waSocket = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['Chuna Store', 'Chrome', '1.0.0']
    });

    waSocket.ev.on('creds.update', saveCreds);

    waSocket.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ WA Connected!');
            try {
                // Replace with a valid test number
                const targetJid = waSocket.user.id.split(':')[0] + '@s.whatsapp.net';
                const buffer = fs.readFileSync('test_image.png'); // Need to create a dummy image
                await waSocket.sendMessage(targetJid, { image: buffer, caption: 'Test Image!' });
                console.log('✅ Image sent successfully to', targetJid);
            } catch (err) {
                console.error('❌ Failed to send image:', err);
            }
            setTimeout(() => process.exit(0), 3000);
        }
    });
}
start();
