const fs = require('fs');
const html = fs.readFileSync('telkomsel.html', 'utf8');

let packages = [];

// Split by <h4 class="modal-title">
const parts = html.split('<h4 class="modal-title">');
for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    const nameMatch = part.match(/^(.*?)<\/h4>/);
    if (!nameMatch) continue;
    let baseName = nameMatch[1].trim();
    
    // Find all spans with float-right
    let dataSize = "";
    // We look for anything that has "GB" or "MB" in a float-right span
    const badgeMatch = part.match(/<span class="[^"]*float-right[^"]*">([^<]*(?:GB|MB))<\/span>/i);
    if (badgeMatch) {
        dataSize = badgeMatch[1].trim();
    }
    
    // Find Masa Aktif
    let masaAktif = "";
    const masaMatch = part.match(/<span class="[^"]*float-right[^"]*">([^<]*(?:Hari|Days))<\/span>/i);
    if (masaMatch) {
        masaAktif = masaMatch[1].trim();
    }
    
    // Find price
    let price = "";
    const priceMatch = part.match(/Harga[\s\S]*?<span class="[^"]*float-right[^"]*">([^<]+)<\/span>/i);
    if (priceMatch) {
        price = priceMatch[1].trim();
    }
    
    // Find order code
    let code = "";
    const orderMatch = part.match(/onclick="order\('([^']+)'/);
    if (orderMatch) {
        code = orderMatch[1].trim();
    }
    
    if (baseName && code) {
        let fullName = baseName;
        if (dataSize) fullName += " " + dataSize;
        if (masaAktif) fullName += " " + masaAktif;
        
        packages.push({
            name: fullName,
            price: price,
            code: code
        });
    }
}

console.log("Found", packages.length, "packages");
console.log(packages.slice(0, 15));

