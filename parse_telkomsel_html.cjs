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
    fs.writeFileSync('telkomsel.html', json.isi);
    console.log("Written to telkomsel.html");
}
test();
