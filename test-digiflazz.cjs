const crypto = require("crypto");
const fetch = require("node-fetch");
require("dotenv").config();

async function test() {
    const user = process.env.DIGIFLAZZ_USERNAME;
    const key = process.env.DIGIFLAZZ_API_KEY;
    const ref = "PRE-1784792371927"; // An old one from logs
    const sku = "xld10";
    const target = "081912345678"; // Dummy target

    const sign = crypto.createHash("md5").update(user + key + ref).digest("hex");
    const res = await fetch("https://api.digiflazz.com/v1/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: user,
            buyer_sku_code: sku,
            customer_no: target,
            ref_id: ref,
            sign: sign
        })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
test();
