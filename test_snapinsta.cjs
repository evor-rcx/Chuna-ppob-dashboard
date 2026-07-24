const axios = require('axios');
const cheerio = require('cheerio');

async function snapinsta(url) {
    try {
        const { data } = await axios.get('https://snapinsta.app/');
        const $ = cheerio.load(data);
        const token = $('input[name="token"]').val();
        
        const params = new URLSearchParams();
        params.append('url', url);
        params.append('action', 'post');
        if (token) params.append('token', token);
        
        const res = await axios.post('https://snapinsta.app/action.php', params, {
            headers: {
                'origin': 'https://snapinsta.app',
                'referer': 'https://snapinsta.app/',
                'user-agent': 'Mozilla/5.0'
            }
        });
        
        console.log(res.data);
    } catch(e) {
        console.error(e.message);
    }
}
snapinsta('https://www.instagram.com/reel/C8_z0vHpxqJ/');
