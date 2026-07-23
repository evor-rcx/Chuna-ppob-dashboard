import { generateCanvasReceipt } from './server';
import fs from 'fs';

async function test() {
    const tx = {
        id: "TEST-12345",
        memberId: "123",
        type: "prepaid",
        product: "Free Fire 140 Diamond",
        sku: "FF140",
        target: "1059282106",
        price: 21000,
        status: "Sukses",
        method: "saldo",
        sn: "Pakk Youmen2",
        date: new Date().toISOString()
    };
    try {
        const buffer = await generateCanvasReceipt("nota", tx);
        if (buffer) {
            console.log("Buffer generated, size:", buffer.length);
        } else {
            console.log("Buffer is null!");
        }
    } catch(e) {
        console.error("Exception:", e);
    }
}
test();
