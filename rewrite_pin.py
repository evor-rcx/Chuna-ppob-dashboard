import re

with open('server.ts', 'r') as f:
    code = f.read()

# 1. We replace pay_prepaid_
prepaid_new = r"""      bot.action(/^pay_prepaid_(.+?)(?:_(cash|utang|saldo))?$/, async (ctx) => {
        await ctx.answerCbQuery();
        const sku = ctx.match[1];
        const method = ctx.match[2] || 'saldo';
        const isOwner = db.owners.includes(ctx.from?.id);
        
        if (method !== 'saldo' && !isOwner) {
            return ctx.reply("❌ Metode pembayaran tidak valid.");
        }
        
        const state = userStates[ctx.from?.id || 0];
        if (!state || state.step !== 'PREPAID_INPUT_NUMBER' || state.data.product.buyer_sku_code !== sku) {
            return ctx.reply("❌ Data transaksi tidak valid atau sudah kadaluarsa. Silakan ulangi pembelian.");
        }
        
        if (!isOwner) {
             userStates[ctx.from?.id || 0] = { step: 'ASK_PIN_PREPAID', data: { ...state.data, method, sku } };
             return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*\nSilakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
        }
        
        await processPrepaidPayment(ctx, sku, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
      });"""

prepaid_regex = re.compile(r"      bot\.action\(\/\^pay_prepaid_\(\.\+\?\)\(\?:\_\(cash\|utang\|saldo\)\)\?\$\/, async \(ctx\) => \{.*?(?=\n      bot\.action\(\/\^pay_pasca_)", re.DOTALL)

prepaid_match = prepaid_regex.search(code)
if prepaid_match:
    prepaid_old_body = prepaid_match.group(0)
    # Extract the payment logic from it
    payment_logic_match = re.search(r'(const product = state\.data\.product;.*)if \(state\.data\.memberId\) \{', prepaid_old_body, re.DOTALL)
    if payment_logic_match:
        payment_logic = payment_logic_match.group(1)
        # Create processPrepaidPayment function
        process_prepaid_func = f"""async function processPrepaidPayment(ctx: any, sku: string, method: string, stateData: any, memberId: string) {{
        const product = stateData.product;
        const total = stateData.totalBayar;
        const targetNo = stateData.targetNo;
        const member = members.find((m: any) => m.id === memberId || m.telegram?.includes(ctx.from?.id?.toString() || ''));
        
        if (!member) return ctx.reply("❌ Member tidak ditemukan.");
        
        if (method === 'saldo') {{
            if (member.balance < total) {{
                return ctx.reply(`❌ TRANSAKSI DITOLAK!
Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.
💳 Saldo Saat Ini: Rp ${{member.balance.toLocaleString('id-ID')}}
💰 Total Bayar: Rp ${{total.toLocaleString('id-ID')}}
Silakan isi ulang saldo kakak terlebih dahulu. 🙏`);
            }}
            member.balance -= total;
            db.members = members;
            writeDB(db);
        }} else if (method === 'utang') {{
            member.balance -= total;
            db.members = members;
            writeDB(db);
        }}
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';
        await ctx.reply(`⏳ Memproses pembelian ${{product.product_name}} ke nomor ${{targetNo}} via ${{methodDisplay}}...`);
        
        const pay_ref_id = "PRE-" + Date.now();
        try {{
            const signText = digiflazzUsername + digiflazzApiKey + pay_ref_id;
            const sign = crypto.createHash("md5").update(signText).digest("hex");
            const res = await fetch("https://api.digiflazz.com/v1/transaction", {{
                method: "POST",
                headers: {{ "Content-Type": "application/json" }},
                body: JSON.stringify({{
                    username: digiflazzUsername,
                    buyer_sku_code: sku,
                    customer_no: targetNo,
                    ref_id: pay_ref_id,
                    sign: sign
                }})
            }});
            const payJson = await res.json();
            if (payJson.data) {{
                const status = payJson.data.status;
                const digiflazzPrice = payJson.data.price || 0;
                const cuan = total - digiflazzPrice;
                let paymentInfo = "";
                if (method === 'saldo') {{
                    paymentInfo = `    💰 SALDO  : "Cusss! Saldo langsung kepotong, 
                 beres dalam sekejap! Kamu jago 
                 banget pake saldo, Chuna salut! 💰✨"`;
                }} else if (method === 'cash') {{
                    paymentInfo = `    💵 CASH   : "Duitnya Chuna terima dengan senyum 
                 lebar! Bayar tunai tetap berkesan! 
                 Makasih udah main ke E4 Store! 🫳🌸"`;
                }} else {{
                    paymentInfo = `    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍
     BAYAR      Kamu pasti bayar tepat waktu karena 
    TEPAT       Chuna tahu kamu pelanggan baik hati.
    WAKTU       Nanti kalau sudah transfer, chat 
                 Chuna aja, nanti Chuna proses dengan 
                 senyum manis! Makasih udah jujur! 💖🤗"`;
                }}
                let msg = "";
                if (status === 'Pending') {{
                    msg = `⏳ TRANSAKSI SEDANG DIPROSES PUSAT
📦 Produk: ${{product.product_name}}
🎯 Tujuan: ${{targetNo}}
Status: Pending ⏳
Pesanan kakak sedang diproses oleh sistem pusat. 
Chuna dari E4 Store minta sabar ya, sayang! 
Sebentar lagi selesai kok, jangan kemana-mana dulu~ 
Sambil nunggu, Chuna siapin cemilan buat kamu! 🚗💨`;
                    await ctx.reply(msg);
                }} else if (status === 'Sukses') {{
                    const sn = payJson.data.sn || "-";
                    const now = new Date();
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const dateStr = `${{now.getDate().toString().padStart(2, '0')}} ${{months[now.getMonth()]}} ${{now.getFullYear()}} WITA`;
                    msg = `HOREE! Sukses, sayang! 🎉🎊 Chuna sampai joget-joget di depan kasir! Pesananmu sudah masuk, semua serba menyenangkan! Makasih ya udah percaya sama E4 Store dan Chuna yang imut ini. Kalau ada kendala, Chuna siap sedia 24 jam di WA. Semoga hari-harimu makin cerah! 💖🌈

📄 Nota Sukses Prabayar:
```
*E4 STORE*
Jl. Zamrud Depan Zamrud 2 RT 42
WA: 6285169959218
------------------------------------
Order ID      : ${{pay_ref_id}}
Tanggal       : ${{dateStr}}
ID Pelanggan  : ${{targetNo}}
Nama          : ${{member.name || "-"}}
------------------------------------
Token / SN    : ${{sn}}
------------------------------------
Pembelian     : ${{product.product_name}}
------------------------------------
Total         : Rp ${{total.toLocaleString('id-ID')}}
------------------------------------
Status        : ✅ SUKSES (LUNAS)
------------------------------------
Pembayaran    :
${{paymentInfo}}
------------------------------------
_Melalui WhatsApp ini, Anda akan menerima informasi 
 berupa notifikasi terkait transaksi Anda di *E4 Store*_
------------------------------------
Terimakasih telah berbelanja di E4 Store!
🐾 Chuna ~ Asisten Imutmu siap bantu 24 jam!
📱 WA: 6285169959218
------------------------------------
````;
                    await ctx.reply(msg, {{ parse_mode: 'Markdown' }});
                }} else {{
                    if (method !== 'cash') {{
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }}
                    msg = `❌ TRANSAKSI GAGAL
📦 Produk: ${{product.product_name}}
🎯 Tujuan: ${{targetNo}}
Status: Gagal ❌
${{method !== 'cash' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : ''}}

Yah, gagal nih, sayang! Tapi Chuna yakin kamu pasti 
bisa coba lagi. Cek data pembayaranmu ya, atau 
hubungi Bos chuna  di WA 6285169959218 buat link whatsapp, nanti Chuna 
bantuin dengan senyum manis! Semangat, jangan 
nangis dulu~ Chuna di sini buat kamu! 💪😘`;
                    await ctx.reply(msg);
                }}
                if (msg && waSocket && member.whatsapp) {{
                    let cleanWa = member.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    try {{
                        await waSocket.sendMessage(jid, {{ text: msg }});
                    }} catch (err) {{
                        console.log("Failed to send WA message:", err);
                    }}
                }}
                if (status === 'Sukses' || status === 'Pending') {{
                    transactions.unshift({{
                        id: pay_ref_id,
                        memberId: member.id,
                        type: "prepaid",
                        product: product.product_name,
                        target: targetNo,
                        price: total,
                        modal: digiflazzPrice,
                        cuan: cuan > 0 ? cuan : 0,
                        status: status,
                        method: method,
                        date: new Date().toISOString()
                    }});
                    if (transactions.length > 50) transactions.pop();
                    db.transactions = transactions;
                    writeDB(db);
                }}
            }} else {{
                if (method !== 'cash') {{
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }}
                let refundMsg = method !== 'cash' ? '\n\nSaldo telah dikembalikan.' : '';
                await ctx.reply(`❌ Pembelian Gagal:\n${{payJson.data?.message || 'Error tidak diketahui'}}${{refundMsg}}`);
            }}
        }} catch (e: any) {{
            transactions.unshift({{
                id: pay_ref_id,
                memberId: member.id,
                type: "prepaid",
                product: product.product_name,
                target: targetNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Pending",
                method: method,
                date: new Date().toISOString()
            }});
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)\n\nPesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\n\nPesan Error: ${{e.message}}`);
        }}
        if (stateData.memberId) {{
            userStates[ctx.from?.id || 0] = {{ step: 'LOCKED_MEMBER', data: {{ memberId: stateData.memberId }} }};
        }} else {{
            delete userStates[ctx.from?.id || 0];
        }}
}}
"""
        code = code.replace(prepaid_old_body, prepaid_new)
        code = code.replace('bot = new Telegraf(token);', process_prepaid_func + '\n      bot = new Telegraf(token);')

# 2. We replace pay_pasca_
pasca_new = r"""      bot.action(/^pay_pasca_(.+?)(?:_(cash|utang|saldo))?$/, async (ctx) => {
        await ctx.answerCbQuery();
        const ref_id = ctx.match[1];
        const method = ctx.match[2] || 'saldo';
        const isOwner = db.owners.includes(ctx.from?.id);
        
        if (method !== 'saldo' && !isOwner) {
            return ctx.reply("❌ Metode pembayaran tidak valid.");
        }
        
        const state = userStates[ctx.from?.id || 0];
        if (!state || !state.data.checkResult || state.data.checkResult.ref_id !== ref_id) {
            return ctx.reply("❌ Data transaksi tidak valid atau sudah kadaluarsa. Silakan ulangi cek tagihan.");
        }
        
        if (!isOwner) {
             userStates[ctx.from?.id || 0] = { step: 'ASK_PIN_PASCA', data: { ...state.data, method, ref_id } };
             return ctx.reply("🔐 *Masukan PIN Keamanan Transaksi*\nSilakan ketik PIN Anda untuk melanjutkan transaksi ini.", { parse_mode: 'Markdown' });
        }
        
        await processPascaPayment(ctx, ref_id, method, state.data, state.data.memberId || `MBR-${ctx.from?.id}`);
      });"""

pasca_regex = re.compile(r"      bot\.action\(\/\^pay_pasca_\(\.\+\?\)\(\?:\_\(cash\|utang\|saldo\)\)\?\$\/, async \(ctx\) => \{.*?(?=\n      bot\.action\(\"cancel_pasca\")", re.DOTALL)

pasca_match = pasca_regex.search(code)
if pasca_match:
    pasca_old_body = pasca_match.group(0)
    # Make processPascaPayment
    process_pasca_func = f"""async function processPascaPayment(ctx: any, ref_id: string, method: string, stateData: any, memberId: string) {{
        const member = members.find((m: any) => m.id === memberId || m.telegram?.includes(ctx.from?.id?.toString() || ''));
        if (!member) return ctx.reply("❌ Member tidak ditemukan.");
        const checkResult = stateData.checkResult;
        const total = stateData.totalBayar;
        const customerNo = stateData.targetNo;
        
        if (method === 'saldo') {{
            if (member.balance < total) {{
                return ctx.reply(`❌ TRANSAKSI DITOLAK!
Maaf kak, saldo kakak tidak mencukupi untuk melakukan transaksi ini.
💳 Saldo Saat Ini: Rp ${{member.balance.toLocaleString('id-ID')}}
💰 Total Bayar: Rp ${{total.toLocaleString('id-ID')}}
Silakan isi ulang saldo kakak terlebih dahulu. 🙏`);
            }}
            member.balance -= total;
            db.members = members;
            writeDB(db);
        }} else if (method === 'utang') {{
            member.balance -= total;
            db.members = members;
            writeDB(db);
        }}
        
        const methodDisplay = method === 'cash' ? '💵 Tunai (Cash)' : method === 'utang' ? '📝 Utang' : '💳 Saldo';
        await ctx.reply(`⏳ Memproses pembayaran tagihan ke nomor ${{customerNo}} via ${{methodDisplay}}...`);
        
        const pay_ref_id = "PAY-" + ref_id;
        try {{
            const signText = digiflazzUsername + digiflazzApiKey + pay_ref_id;
            const sign = crypto.createHash("md5").update(signText).digest("hex");
            const res = await fetch("https://api.digiflazz.com/v1/transaction", {{
                method: "POST",
                headers: {{ "Content-Type": "application/json" }},
                body: JSON.stringify({{
                    commands: "pay-pasca",
                    username: digiflazzUsername,
                    buyer_sku_code: stateData.product.buyer_sku_code,
                    customer_no: customerNo,
                    ref_id: pay_ref_id,
                    sign: sign
                }})
            }});
            const payJson = await res.json();
            if (payJson.data) {{
                const status = payJson.data.status;
                const result = payJson.data;
                const digiflazzPrice = payJson.data.price || 0;
                const cuan = total - digiflazzPrice;
                let paymentInfo = "";
                if (method === 'saldo') {{
                    paymentInfo = `    💰 SALDO  : "Cusss! Saldo langsung kepotong, 
                 beres dalam sekejap! Kamu jago 
                 banget pake saldo, Chuna salut! 💰✨"`;
                }} else if (method === 'cash') {{
                    paymentInfo = `    💵 CASH   : "Duitnya Chuna terima dengan senyum 
                 lebar! Bayar tunai tetap berkesan! 
                 Makasih udah main ke E4 Store! 🫳🌸"`;
                }} else {{
                    paymentInfo = `    📝 JANJI   : "Chuna percaya 100% sama kamu! 😍
     BAYAR      Kamu pasti bayar tepat waktu karena 
    TEPAT       Chuna tahu kamu pelanggan baik hati.
    WAKTU       Nanti kalau sudah transfer, chat 
                 Chuna aja, nanti Chuna proses dengan 
                 senyum manis! Makasih udah jujur! 💖🤗"`;
                }}
                let replyMsg = "";
                if (status === 'Pending') {{
                    replyMsg = `⏳ PEMBAYARAN SEDANG DIPROSES PUSAT
📦 Produk: ${{stateData.product.product_name}}
🎯 Tujuan: ${{customerNo}}
Status: Pending ⏳
Tagihan kakak sedang dibayar oleh sistem pusat. 
Chuna dari E4 Store minta sabar ya, sayang! 
Sebentar lagi lunas kok, tenang aja~ 
Sambil nunggu, Chuna siapin cemilan buat kamu! 🚗💨`;
                    await ctx.reply(replyMsg);
                }} else if (status === 'Sukses') {{
                    const now = new Date();
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const dateStr = `${{now.getDate().toString().padStart(2, '0')}} ${{months[now.getMonth()]}} ${{now.getFullYear()}} WITA`;
                    const pName = result.customer_name || member.name || "-";
                    const segmentPower = result.segment_power ? `Tarif/Daya    : ${{result.segment_power}}\n` : "";
                    const descObj = result.desc || {{}};
                    const meterInfo = (descObj.meter_awal && descObj.meter_akhir) ? `Meter Awal    : ${{descObj.meter_awal}}\nMeter Akhir   : ${{descObj.meter_akhir}}\n` : "";
                    replyMsg = `HOREE! Sukses besar, sayang! 🎉🎊 Chuna sampai terharu! Tagihan bulananmu sudah lunas, rumah tetap terang, dan Chuna ikut bangga karena kamu bayar tepat waktu! Makasih ya udah percaya sama E4 Store. Simpan nota ini buat arsip. Kalau ada pertanyaan, Chuna selalu standby di WA. Semoga bulan depan tagihan makin ringan dan rezeki makin deras! 💖🌈

📄 Nota Sukses Pascabayar:
```
*E4 STORE*
Jl. Zamrud Depan Zamrud 2 RT 42
WA: 6285169959218
------------------------------------
Order ID      : ${{pay_ref_id}}
Tanggal       : ${{dateStr}}
ID Pelanggan  : ${{customerNo}}
Nama          : ${{pName}}
${{segmentPower}}${{meterInfo}}------------------------------------
Pembayaran    : ${{stateData.product.product_name}}
------------------------------------
Total         : Rp ${{total.toLocaleString('id-ID')}}
------------------------------------
Status        : ✅ SUKSES (LUNAS)
------------------------------------
Pembayaran    :
${{paymentInfo}}
------------------------------------
_Melalui WhatsApp ini, Anda akan menerima informasi 
 berupa notifikasi terkait transaksi Anda di *E4 Store*_
------------------------------------
Terimakasih telah berbelanja di E4 Store!
🐾 Chuna ~ Asisten Imutmu siap bantu 24 jam!
📱 WA: 6285169959218
------------------------------------
````;
                    await ctx.reply(replyMsg, {{ parse_mode: 'Markdown' }});
                }} else {{
                    if (method !== 'cash') {{
                        member.balance += total;
                        db.members = members;
                        writeDB(db);
                    }}
                    replyMsg = `❌ PEMBAYARAN GAGAL
📦 Produk: ${{stateData.product.product_name}}
🎯 Tujuan: ${{customerNo}}
Status: Gagal ❌
${{method !== 'cash' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : ''}}

Yah, gagal nih, sayang! Mungkin ada gangguan sistem.
Coba lagi nanti ya, atau hubungi Bos chuna di WA 6285169959218
Chuna siap bantuin sampai lunas! Semangat! 💪😘`;
                    await ctx.reply(replyMsg);
                }}
                if (replyMsg && waSocket && member.whatsapp) {{
                    let cleanWa = member.whatsapp.replace(/\D/g, "");
                    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.substring(1);
                    const jid = cleanWa + "@s.whatsapp.net";
                    try {{
                        await waSocket.sendMessage(jid, {{ text: replyMsg }});
                    }} catch (err) {{}}
                }}
                if (status === 'Sukses' || status === 'Pending') {{
                    transactions.unshift({{
                        id: pay_ref_id,
                        memberId: member.id,
                        type: "pasca",
                        product: stateData.product.product_name,
                        target: customerNo,
                        price: total,
                        modal: digiflazzPrice,
                        cuan: cuan > 0 ? cuan : 0,
                        status: status,
                        method: method,
                        date: new Date().toISOString()
                    }});
                    if (transactions.length > 50) transactions.pop();
                    db.transactions = transactions;
                    writeDB(db);
                }}
            }} else {{
                if (method !== 'cash') {{
                    member.balance += total;
                    db.members = members;
                    writeDB(db);
                }}
                let refundMsg = method !== 'cash' ? '\n\nSaldo telah dikembalikan.' : '';
                await ctx.reply(`❌ Pembayaran Gagal:\n${{payJson.data?.message || 'Error tidak diketahui'}}${{refundMsg}}`);
            }}
        }} catch (e: any) {{
            transactions.unshift({{
                id: pay_ref_id,
                memberId: member.id,
                type: "pasca",
                product: stateData.product.product_name,
                target: customerNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Pending",
                method: method,
                date: new Date().toISOString()
            }});
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            await ctx.reply(`⏳ Pembayaran Tagihan Sedang Diproses (Network Error)\n\nPembayaranmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\n\nPesan Error: ${{e.message}}`);
        }}
        if (stateData.memberId) {{
            userStates[ctx.from?.id || 0] = {{ step: 'LOCKED_MEMBER', data: {{ memberId: stateData.memberId }} }};
        }} else {{
            delete userStates[ctx.from?.id || 0];
        }}
}}
"""
code = code.replace(pasca_old_body, pasca_new)
code = code.replace('bot = new Telegraf(token);', process_pasca_func + '\n      bot = new Telegraf(token);')


# 3. Add pollMessageDeletion
poll_func = r"""
async function pollMessageDeletion(ctx: any, userId: number, msgId: number, type: string, stateData: any) {
    let attempts = 0;
    const ownerId = db.owners[0];
    const checkInterval = setInterval(async () => {
        attempts++;
        if (attempts > 60) {
            clearInterval(checkInterval);
            if (userStates[userId]?.data?.pinMessageId === msgId) {
                delete userStates[userId];
                ctx.telegram.sendMessage(userId, "❌ Waktu habis! Kamu belum menghapus pesan PIN-nya. Transaksi dibatalkan demi keamanan ya, sayang! 💔");
            }
            return;
        }
        try {
            const fw = await bot!.telegram.forwardMessage(ownerId, userId, msgId, { disable_notification: true });
            await bot!.telegram.deleteMessage(ownerId, fw.message_id).catch(() => {});
        } catch (e: any) {
            if (e.message.includes('message to forward not found') || e.message.includes('message not found')) {
                clearInterval(checkInterval);
                if (userStates[userId]?.data?.pinMessageId === msgId) {
                    await ctx.telegram.sendMessage(userId, "✅ Hebat! PIN sudah dihapus. Sekarang Chuna proses transaksinya ya... 🚀");
                    if (type === 'PREPAID') {
                        await processPrepaidPayment(ctx, stateData.sku, stateData.method, stateData, stateData.memberId || `MBR-${userId}`);
                    } else {
                        await processPascaPayment(ctx, stateData.ref_id, stateData.method, stateData, stateData.memberId || `MBR-${userId}`);
                    }
                }
            }
        }
    }, 2000);
}
"""
code = code.replace('bot = new Telegraf(token);', poll_func + '\n      bot = new Telegraf(token);')

# 4. Insert into bot.on("text")
switch_insert = r"""            switch (state.step) {
                case 'ASK_PIN_PREPAID': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }
                    const msgId = ctx.message.message_id;
                    await ctx.reply("🤫 Sstt... PIN-nya benar, sayang! Tapi demi keamanan, ayo hapus pesan yang isinya PIN kamu barusan. Kalau udah dihapus, Chuna akan langsung proses transaksinya! 💕✨");
                    state.step = 'WAIT_DELETE_PIN_PREPAID';
                    state.data.pinMessageId = msgId;
                    pollMessageDeletion(ctx, userId, msgId, 'PREPAID', state.data);
                    return;
                }
                case 'ASK_PIN_PASCA': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }
                    const msgId = ctx.message.message_id;
                    await ctx.reply("🤫 Sstt... PIN-nya benar, sayang! Tapi demi keamanan, ayo hapus pesan yang isinya PIN kamu barusan. Kalau udah dihapus, Chuna akan langsung proses transaksinya! 💕✨");
                    state.step = 'WAIT_DELETE_PIN_PASCA';
                    state.data.pinMessageId = msgId;
                    pollMessageDeletion(ctx, userId, msgId, 'PASCA', state.data);
                    return;
                }
                case 'WAIT_DELETE_PIN_PREPAID':
                case 'WAIT_DELETE_PIN_PASCA':
                    return ctx.reply("Hapus pesan PIN kamu dulu ya sayang, baru bisa lanjut! 🥺💕");
"""

code = code.replace("            switch (state.step) {", switch_insert)

with open('server.ts', 'w') as f:
    f.write(code)

print("Replacement done.")
