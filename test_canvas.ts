import { generateCanvasReceipt } from './server.ts';

async function test() {
    const data = {
        id: "D-12345",
        date: new Date(),
        memberId: "123",
        target: "081234567890",
        sn: "1234-5678-9012/BUDI/R1/900",
        product: { product_name: "Token PLN 50.000", price: 52000 },
        total: 52000,
        status: "Sukses"
    };
    
    const buf = await generateCanvasReceipt("nota", data);
    console.log(buf ? buf.length : "null");
}

test();
