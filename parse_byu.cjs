const fs = require('fs');
const json = JSON.parse(fs.readFileSync('byu.html', 'utf8'));
const html = json.isi;

let packages = [];
const parts = html.split('<h4 class="modal-title">');
for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    const nameMatch = part.match(/^(.*?)</);
    if (!nameMatch) continue;
    let baseName = nameMatch[1].trim();
    
    // Sometimes name is empty, look at description
    const descMatch = part.match(/<div class="card-body">\s*(.*?)\s*<\/div>/);
    if (descMatch && !baseName) {
        baseName = descMatch[1].trim();
    }
    
    let price = "";
    const priceMatch = part.match(/Harga[\s\S]*?<span class="[^"]*float-right[^"]*">([^<]+)<\/span>/i);
    if (priceMatch) {
        price = priceMatch[1].trim();
    }
    
    // We also need the order params for by.u
    // onclick="order('kode', 'id', num, 'menu_id')"
    let kodebeli = "";
    const orderMatch = part.match(/onclick="order\('([^']+)',\s*'([^']+)',\s*(\d+),\s*'([^']+)'\)"/);
    
    let pkg = { name: baseName, price: price };
    if (orderMatch) {
        pkg.arg1 = orderMatch[1];
        pkg.arg2 = orderMatch[2];
        pkg.arg3 = orderMatch[3];
        pkg.arg4 = orderMatch[4];
        
        // The value of kodebeli field might override arg1
        const kodebeliField = part.match(new RegExp(`id="kodebeli_${pkg.arg2}"[^>]*value="([^"]+)"`));
        if (kodebeliField) {
            pkg.kodebeliValue = kodebeliField[1];
        } else {
            pkg.kodebeliValue = pkg.arg1;
        }
        
        packages.push(pkg);
    }
}

console.log("Found", packages.length, "packages");
console.log(packages.slice(0, 10));
