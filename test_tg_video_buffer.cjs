const axios = require('axios');
async function test() {
    try {
        const url = 'https://dl.tiktokio.com/download?token=atHsRx0cccHM6Ly92MTYudG9rY2RuLmNvbS84MmM3YzY5YWU0ZDY5M2Y1NDRmYzcxMWNkM2U2NmU1Ny82YTUwMzYwMC83NjYwODgxNTI0ODA3NjE3ODEyX29yaWdpbmFsLm1wNDE3ODQ4MTYwODUO0O0O&p=dtGslxrcacW8uY29tMTc4NDgxNjA4NQO0O0OO0O0O';
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        console.log("Buffer length:", res.data.length);
    } catch(e) {
        console.error("Error:", e.message);
    }
}
test();
