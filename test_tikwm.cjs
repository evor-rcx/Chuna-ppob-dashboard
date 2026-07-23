const axios = require('axios');
async function test() {
    try {
        const res = await axios.get('https://tikwm.com/api/', { params: { url: 'https://vt.tiktok.com/ZSXGKhpF6/' }});
        console.log(res.data.data.play);
    } catch(e) {
        console.error(e);
    }
}
test();
