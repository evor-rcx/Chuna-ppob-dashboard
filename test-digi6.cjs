const crypto = require('crypto');
const username = "xxx";
const key = "yyy";
const ref_id = "test_123"; 
const sign = crypto.createHash("md5").update(username+key+ref_id).digest("hex");
console.log(JSON.stringify({
    username: username,
    buyer_sku_code: "xld10",
    customer_no: "08123456789",
    ref_id: ref_id,
    sign: sign
}));
