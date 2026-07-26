const fs = require('fs');
const html = fs.readFileSync('telkomsel.html', 'utf8');

const regex3 = /<h4 class="modal-title">\s*(.*?)\s*<\/h4>[\s\S]*?(?:<span class="">\s*Internet\s*<span class=" float-right">([^<]+)<\/span>\s*<\/span>)?[\s\S]*?Harga[\s\S]*?<span class=" float-right ">([^<]+)<\/span>[\s\S]*?onclick="order\('([^']+)'/gi;

let match;
let packages3 = [];
while ((match = regex3.exec(html)) !== null) {
    let name = match[1];
    let data = match[2];
    let price = match[3];
    let code = match[4];
    packages3.push({
        name: data ? name + " " + data : name,
        price: price,
        code: code
    });
}
console.log(packages3.slice(0, 10));

