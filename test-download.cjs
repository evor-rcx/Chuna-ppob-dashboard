const fetch = require('node-fetch');
async function test() {
    try {
        const res = await fetch('https://dl.tiktokio.com/download?token=atHsRx0cccHM6Ly92MTYudG9rY2RuLmNvbS9kM2NkNTM3ZDdlOTBlZDFiNjVmNzAxMTU3OTNkMzFlOS82MjllOTUwMC83MTA2NTk0MzEyMjkyNDUzNjc1X29yaWdpbmFsLm1wNDE3ODQ4NzgzNDYO0O0O&p=dtGslxrcacW8uY29tMTc4NDg3ODM0NgO0O0OO0O0O', { redirect: 'follow' });
        console.log(res.status);
        console.log(res.headers.get('content-type'));
    } catch (e) {
        console.log(e.message);
    }
}
test();
