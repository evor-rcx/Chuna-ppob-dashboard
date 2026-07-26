const nohp = "085112345678"; // Example byU number? I need a real one or it might fail.

async function test() {
    // 1. Get token
    const res = await fetch("https://kodebayar.web.id/byu");
    const text = await res.text();
    const tokenMatch = text.match(/<input id="token" name="ci_csrf_token" type="hidden" value="([^"]+)">/);
    if (!tokenMatch) return console.log("No token found");
    const token = tokenMatch[1];
    const cookie = res.headers.get("set-cookie");

    console.log("Token:", token);

    // 2. Search
    const params = new URLSearchParams();
    params.append("nohp", nohp);
    params.append("menu_id", "");
    params.append("ci_csrf_token", token);

    const res2 = await fetch("https://kodebayar.web.id/home/search_page?provider=BYU", {
        method: "POST",
        body: params,
        headers: {
            "Cookie": cookie
        }
    });
    const data = await res2.json();
    console.log("Response:", data);
}
test();
