const crypto = require('crypto');
const username = "xxx";
const key = "yyy";
const ref_id = "test_123";
const sign = crypto.createHash("md5").update(username+key+ref_id).digest("hex");
console.log(JSON.stringify({
    commands: "pay-pasca",
    username: username,
    buyer_sku_code: "pdam",
    customer_no: "123456",
    ref_id: ref_id,
    sign: sign
}));
