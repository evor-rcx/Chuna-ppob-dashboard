const fs = require('fs');
const html = fs.readFileSync('telkomsel.html', 'utf8');

const regex2 = /<h4 class="modal-title">\s*(.*?)\s*<\/h4>[\s\S]*?(?:<span class="[^"]*float-right[^"]*">([^<]+)<\/span>)?[\s\S]*?Harga[\s\S]*?<span class=" float-right ">([^<]+)<\/span>[\s\S]*?onclick="order\('([^']+)'/gi;
let match;
let packages2 = [];
while ((match = regex2.exec(html)) !== null) {
    packages2.push({
        name: match[1],
        price: match[3],
        code: match[4]
    });
}
console.log("Found", packages2.length);
console.log(packages2.slice(0, 5));

