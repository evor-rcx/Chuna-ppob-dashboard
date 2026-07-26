const fs = require('fs');

async function test() {
    const params = new URLSearchParams();
    params.append("nohp", "081350901128");
    params.append("menu_id", "");
    params.append("ci_csrf_token", "");

    const res = await fetch("https://kodebayar.web.id/home/search_page?provider=TELKOMSEL", {
        method: "POST",
        body: params
    });
    const json = await res.json();
    if (!json.isi) return;
    
    let regex = /<h6[^>]*>(.*?)<\/h6>[\s\S]*?<div[^>]*>[\s\S]*?<b[^>]*>(.*?)<\/b>[\s\S]*?<button[^>]*onclick="pay\('([^']+)'/gi;
    let match;
    let packages = [];
    while ((match = regex.exec(json.isi)) !== null) {
        packages.push({
            name: match[1],
            price: match[2],
            code: match[3]
        });
    }
    console.log("Found", packages.length, "packages");
    console.log(packages.slice(0, 5));
}
test();
