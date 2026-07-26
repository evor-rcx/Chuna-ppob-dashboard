const nohp = "085169949218"; // By.U number from the user's screenshot!

async function test() {
    const res = await fetch("https://kodebayar.web.id/byu");
    let cookie = res.headers.get("set-cookie");
    if (cookie) {
        cookie = cookie.split(';')[0];
    } else { cookie = ""; }

    const params = new URLSearchParams();
    params.append("nohp", nohp);
    params.append("menu_id", "");
    params.append("ci_csrf_token", "");

    const res2 = await fetch("https://kodebayar.web.id/home/search_page?provider=BYU", {
        method: "POST",
        body: params,
        headers: {
            "Cookie": cookie
        }
    });
    const text = await res2.text();
    console.log("Response text length:", text.length);
    console.log(text.substring(0, 500));
}
test();
