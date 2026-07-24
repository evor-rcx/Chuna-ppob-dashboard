import re

with open('server.ts', 'r') as f:
    code = f.read()

# For prepaid
# Find: const pay_ref_id = "PRE-" + Date.now();
# We will just replace the whole catch block of pay_prepaid_
prepaid_catch = r"""\} catch \(e: any\) \{
            // Refund on exception
            if \(method !== 'cash'\) \{
                member\.balance \+= total;
                db\.members = members;
                writeDB\(db\);
            \}
            let refundMsg = method !== 'cash' \? '\\n\\nSaldo telah dikembalikan\.' : '';
            await ctx\.reply\(`❌ Terjadi kesalahan jaringan saat memproses transaksi\.\\n\$\{e\.message \|\| ''\}\$\{refundMsg\}`\);
        \}"""

prepaid_replacement = """} catch (e: any) {
            // DO NOT REFUND ON EXCEPTION to prevent ghost balance bug!
            // Digiflazz might still process it. Save as Pending.
            transactions.unshift({
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
            });
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)\\n\\nPesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\\n\\nPesan Error: ${e.message}`);
        }"""

code = re.sub(prepaid_catch, prepaid_replacement, code)

# We also need to move `const pay_ref_id = "PRE-" + Date.now();` outside the try block.
code = code.replace(
"""        try {
            const pay_ref_id = "PRE-" + Date.now();""",
"""        const pay_ref_id = "PRE-" + Date.now();
        try {""")

# For pasca
pasca_catch = r"""\} catch \(e: any\) \{
            // Refund on error
            if \(method !== 'cash'\) \{
                member\.balance \+= total;
                db\.members = members;
                writeDB\(db\);
            \}
            let refundMsg = method !== 'cash' \? '\\n\\nSaldo telah dikembalikan\.' : '';
            await ctx\.reply\(`❌ Terjadi kesalahan saat memproses pembayaran: \$\{e\.message\}\$\{refundMsg\}`\);
        \}"""

pasca_replacement = """} catch (e: any) {
            // DO NOT REFUND ON EXCEPTION to prevent ghost balance bug!
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "pasca",
                product: state.data.product.product_name,
                target: customerNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Pending",
                method: method,
                date: new Date().toISOString()
            });
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);

            await ctx.reply(`⏳ Pembayaran Tagihan Sedang Diproses (Network Error)\\n\\nPembayaranmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\\n\\nPesan Error: ${e.message}`);
        }"""

code = re.sub(pasca_catch, pasca_replacement, code)

code = code.replace(
"""        try {
            const pay_ref_id = "PAY-" + Date.now();""",
"""        const pay_ref_id = "PAY-" + Date.now();
        try {""")

with open('server.ts', 'w') as f:
    f.write(code)

print("Exceptions patched")
