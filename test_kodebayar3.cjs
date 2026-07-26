const nohp = "085169949218"; // By.U number from the user's screenshot!

async function test() {
    const params = new URLSearchParams();
    params.append("nohp", nohp);
    params.append("menu_id", "");
    params.append("ci_csrf_token", "");

    const res2 = await fetch("https://kodebayar.web.id/home/search_page?provider=BYU", {
        method: "POST",
        body: params
    });
    const data = await res2.json();
    console.log("Keys:", Object.keys(data));
    console.log("is_valid_number:", data.is_valid_number);
    console.log("menu length:", data.menu ? data.menu.length : 0);
    // Write isi to file so we can inspect
    const fs = require('fs');
    fs.writeFileSync('isi.html', data.isi);
    console.log("Saved isi to isi.html");
}
test();
