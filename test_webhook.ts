async function test() {
    try {
        const res = await fetch("http://127.0.0.1:3000/webhook", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    ref_id: 'PRE-1783416297473',
                    customer_no: '1790',
                    buyer_sku_code: 'EToM90',
                    message: 'Gagal memproses API Buyer kid',
                    status: 'Gagal',
                    rc: '42',
                    sn: ''
                }
            })
        });
        console.log(res.status, await res.text());
    } catch(e) {
        console.error(e);
    }
}
test();
