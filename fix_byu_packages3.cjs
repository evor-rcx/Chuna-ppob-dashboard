const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getByuPackagesFunc = `async function getByuPackages(nohp: string): Promise<any[]> {
    try {
        const params = new URLSearchParams();
        params.append("nohp", nohp);
        params.append("menu_id", "");
        params.append("ci_csrf_token", "");

        const res = await fetch("https://kodebayar.web.id/home/search_page?provider=BYU", {
            method: "POST",
            body: params
        });
        const data = await res.json();
        if (!data.is_valid_number) return [];
        const html = data.isi;
        
        let packages = [];
        const parts = html.split('<h4 class="modal-title">');
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            
            const nameMatch = part.match(/^(.*?)</);
            if (!nameMatch) continue;
            let baseName = nameMatch[1].trim();
            
            const descMatch = part.match(/<div class="card-body">\\s*(.*?)\\s*<\\/div>/);
            if (descMatch && !baseName) {
                baseName = descMatch[1].trim();
            }
            
            let price = "";
            const priceMatch = part.match(/Harga[\\s\\S]*?<span class="[^"]*float-right[^"]*">([^<]+)<\\/span>/i);
            if (priceMatch) {
                price = priceMatch[1].trim();
            }
            
            const orderMatch = part.match(/onclick="order\\('([^']+)',\\s*'([^']+)',\\s*(\\d+),\\s*'([^']+)'\\)"/);
            if (orderMatch && baseName) {
                let pkg: any = { name: baseName, price: price };
                pkg.arg1 = orderMatch[1];
                pkg.arg2 = orderMatch[2];
                pkg.arg3 = orderMatch[3];
                pkg.arg4 = orderMatch[4];
                
                const kodebeliField = part.match(new RegExp(\`id="kodebeli_\${pkg.arg2}"[^>]*value="([^"]+)"\`));
                pkg.kodebeliValue = kodebeliField ? kodebeliField[1] : pkg.arg1;
                pkg.token = data.token;
                
                packages.push(pkg);
            }
        }
        
        const unique = [];
        const seen = new Set();
        for (const p of packages) {
            const key = p.name + p.price;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(p);
            }
        }
        return unique;
    } catch (e) {
        console.error("BYU scrape error", e);
        return [];
    }
}

async function generateByuKodeBayar(nohp: string, pkg: any): Promise<string | null> {
    try {
        const orderParams = new URLSearchParams();
        orderParams.append("nohp", nohp);
        orderParams.append("kode", pkg.kodebeliValue);
        orderParams.append("id", pkg.arg3);
        orderParams.append("menu_id", pkg.arg4);
        orderParams.append("ci_csrf_token", pkg.token);
        
        const res2 = await fetch("https://kodebayar.web.id/home/inquiry_page?provider=BYU", {
            method: "POST",
            body: orderParams
        });
        const orderData = await res2.json();
        return orderData.kode_bayar || null;
    } catch (e) {
        console.error("BYU generate kode bayar error", e);
        return null;
    }
}`;

code = code.replace(/async function getByuKodeBayar\([\s\S]*?console\.error\("By\.U scrape error", e\);\n        return null;\n    }\n}/g, getByuPackagesFunc);

fs.writeFileSync('server.ts', code);
console.log("Replaced getByuKodeBayar properly!");
