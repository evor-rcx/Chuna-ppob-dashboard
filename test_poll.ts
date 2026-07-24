import * as fs from 'fs';
import * as crypto from 'crypto';

async function test() {
    const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const digiflazzUsername = db.digiflazzUsername;
    const digiflazzApiKey = db.digiflazzApiKey;
    
    const tx = db.transactions.find((t: any) => t.status === 'Pending');
    if (!tx) {
        console.log("No pending tx");
        return;
    }
    console.log("Found tx:", tx);
    
    let body: any = {
        username: digiflazzUsername,
        buyer_sku_code: tx.sku,
        customer_no: tx.target,
        ref_id: tx.id,
        sign: crypto.createHash("md5").update(digiflazzUsername + digiflazzApiKey + tx.id).digest("hex")
    };
    
    if (tx.type === 'pasca') {
        body.commands = "pay-pasca";
    }

    const res = await fetch("https://api.digiflazz.com/v1/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    
    const json = await res.json();
    console.log("Digiflazz response:", json);
}

test();
