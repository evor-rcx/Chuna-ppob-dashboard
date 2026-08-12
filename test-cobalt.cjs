const axios = require('axios');
async function run() {
    try {
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: 'https://youtu.be/7SeQg9X4N0c?si=98n-xX48FGfDzqbR'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data);
    } catch(e) {
         console.error("Cobalt error:", e.response ? e.response.data : e.message);
    }
}
run();
