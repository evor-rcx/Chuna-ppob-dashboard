const crypto = require('crypto');
const db = require('./db.json');

async function test() {
  if (!db.digiflazzUsername || !db.digiflazzApiKey) return console.log("No digiflazz creds");
  const sign = crypto.createHash('md5').update(db.digiflazzUsername + db.digiflazzApiKey + "PRE-1720379059520").digest('hex'); // Just an example
  // we don't know a real pending ref_id, let's just see how to fetch one of the pending transactions
  const pending = db.transactions.find(t => t.status === 'Pending');
  if (!pending) return console.log("No pending transactions to test");
  
  const txSign = crypto.createHash('md5').update(db.digiflazzUsername + db.digiflazzApiKey + pending.id).digest('hex');
  const body = {
    username: db.digiflazzUsername,
    buyer_sku_code: pending.sku,
    customer_no: pending.target,
    ref_id: pending.id,
    sign: txSign
  };
  
  console.log("Checking:", body);
  const res = await fetch("https://api.digiflazz.com/v1/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
  });
  console.log("Status code:", res.status);
  const json = await res.json();
  console.log("Response:", JSON.stringify(json, null, 2));
}
test();
