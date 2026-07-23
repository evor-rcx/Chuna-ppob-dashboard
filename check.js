import fetch from 'node-fetch';
async function run() {
  const urls = [
    "https://v2.ouzen.xyz/api/game/ml?id=123456&zone=1234",
    "https://v2.ouzen.xyz/api/game/ff?id=123456789",
    "https://api.wudysoft.com/api/ff?id=123456789",
    "https://api.diki.my.id/game/ml?id=1234&zone=1234",
    "https://api.lolhuman.xyz/api/freefire?apikey=haibe&id=12345"
  ];
  for (let u of urls) {
    try {
      const res = await fetch(u);
      console.log(u, res.status);
    } catch(e) { console.log(u, "Failed"); }
  }
}
run();
