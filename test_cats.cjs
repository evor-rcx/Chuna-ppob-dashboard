const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const crypto = require('crypto');
async function run() {
    let signText = db.digiflazzUsername + db.digiflazzApiKey + "pricelist";
    const sign = crypto.createHash("md5").update(signText).digest("hex");
    const response = await fetch("https://api.digiflazz.com/v1/price-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cmd: "prepaid",
          username: db.digiflazzUsername,
          sign: sign
        })
    });
    const data = await response.json();
    console.log(data);
}
run();
