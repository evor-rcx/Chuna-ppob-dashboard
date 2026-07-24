const crypto = require('crypto');
const db = require('./db.json');

async function test() {
  const t = db.transactions[0];
  if (!t) return;
  const txSign = crypto.createHash('md5').update(db.digiflazzUsername + db.digiflazzApiKey + t.id).digest('hex');
  const body = {
    username: db.digiflazzUsername,
    buyer_sku_code: t.sku,
    customer_no: t.target,
    ref_id: t.id,
    sign: txSign
  };
  
  console.log("Checking:", body);
  const res = await fetch("https://api.digiflazz.com/v1/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
  });
  const json = await res.json();
  console.log("Response:", JSON.stringify(json, null, 2));
}
test();
