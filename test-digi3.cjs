const crypto = require('crypto');
const username = "xxx";
const key = "yyy";
const ref_id = "PAY-INQ-123456";
const sign = crypto.createHash("md5").update(username+key+ref_id).digest("hex");
console.log(JSON.stringify({
    commands: "status-pasca",
    username: username,
    buyer_sku_code: "pdam",
    customer_no: "123456",
    ref_id: ref_id,
    sign: sign
}));
