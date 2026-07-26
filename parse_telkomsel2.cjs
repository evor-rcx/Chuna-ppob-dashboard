const fs = require('fs');

async function test() {
    const html = fs.readFileSync('telkomsel.html', 'utf8');
    
    let regex = /<h6[^>]*>(.*?)<\/h6>[\s\S]*?<b[^>]*>(.*?)<\/b>[\s\S]*?onclick="order\('([^']+)'/gi;
    let match;
    let packages = [];
    while ((match = regex.exec(html)) !== null) {
        packages.push({
            name: match[1].trim(),
            price: match[2].trim(),
            code: match[3]
        });
    }
    console.log("Found", packages.length, "packages");
    console.log(packages.slice(0, 5));
}
test();
