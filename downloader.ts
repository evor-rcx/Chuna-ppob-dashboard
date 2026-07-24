import axios from 'axios';

export async function getRealUrl(shortUrl: string): Promise<string> {
    try {
        const response = await axios.get(shortUrl, {
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });
        if (response.headers.location) {
            return response.headers.location;
        }
        return shortUrl;
    } catch (error: any) {
        if (error.response && error.response.headers.location) {
            return error.response.headers.location;
        }
        return shortUrl;
    }
}

export async function fetchTiktok(url: string) {
    try {
        let realUrl = url;
        if (url.includes('vt.tiktok.com') || url.includes('vm.tiktok.com')) {
            realUrl = await getRealUrl(url);
        }
        
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(realUrl)}`);
        if (res.data && res.data.code === 0) {
            return res.data.data;
        }
        return null;
    } catch (e) {
        console.error("fetchTiktok error", e);
        return null;
    }
}
