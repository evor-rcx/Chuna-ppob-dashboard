const crypto = require('crypto');
const username = "luck";
const key = "luck"; // fake
const ref_id = "PAY-INQ-" + Date.now();
const sign = crypto.createHash("md5").update(username+key+ref_id).digest("hex");
console.log(JSON.stringify({
    commands: "pay-pasca",
    username: username,
    buyer_sku_code: "pdam",
    customer_no: "123456",
    ref_id: ref_id,
    sign: sign
}));
