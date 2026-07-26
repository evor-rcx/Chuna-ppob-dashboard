const fetch = require('node-fetch');

async function getKodeBayarPackages(nohp, providerStr) {
    try {
        const params = new URLSearchParams();
        params.append("nohp", nohp);
        params.append("menu_id", "");
        params.append("ci_csrf_token", "");
        const res = await fetch("https://kodebayar.web.id/home/search_page?provider=" + providerStr, {
            method: "POST",
            body: params
        });
        const json = await res.json();
        if (!json.isi) return [];
        const html = json.isi;
        
        let packages = [];
        const parts = html.split('<h4 class="modal-title">');
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            const nameMatch = part.match(/^(.*?)<\/h4>/);
            if (!nameMatch) continue;
            let baseName = nameMatch[1].trim();
            
            let dataSize = "";
            const badgeMatch = part.match(/<span class="[^"]*float-right[^"]*">([^<]*(?:GB|MB))<\/span>/i);
            if (badgeMatch) dataSize = badgeMatch[1].trim();
            
            let masaAktif = "";
            const masaMatch = part.match(/<span class="[^"]*float-right[^"]*">([^<]*(?:Hari|Days))<\/span>/i);
            if (masaMatch) masaAktif = masaMatch[1].trim();
            
            let price = "";
            const priceMatch = part.match(/Harga[\s\S]*?<span class="[^"]*float-right[^"]*">([^<]+)<\/span>/i);
            if (priceMatch) price = priceMatch[1].trim();
            
            let code = "";
            const orderMatch = part.match(/onclick="order\('([^']+)'/);
            if (orderMatch) code = orderMatch[1].trim();
            
            if (baseName && code) {
                let fullName = baseName;
                if (dataSize) fullName += " " + dataSize;
                if (masaAktif) fullName += " " + masaAktif;
                packages.push({ name: fullName, price: price, code: code });
            }
        }
        return packages;
    } catch (e) {
        console.error("Kodebayar scrape error", e);
        return [];
    }
}
getKodeBayarPackages("085169949218", "BYU").then(console.log);
