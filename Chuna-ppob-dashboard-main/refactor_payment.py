import re

with open('server.ts', 'r') as f:
    code = f.read()

# EXTRACT PREPAID PAYMENT LOGIC
prepaid_match = re.search(r'(const product = state\.data\.product;.*?)(?=\n      bot\.action\(\/cancel_prepaid\/)', code, re.DOTALL)
if not prepaid_match:
    print("Prepaid logic not found!")
    exit(1)

prepaid_logic = prepaid_match.group(1)

# We replace the prepaid bot.action body
prepaid_action_start = r"""      bot.action(/^\^pay_prepaid_\(\.\+\?\)\(\?:\_\(cash\|utang\|saldo\)\)\?\$\/, async \(ctx\) => \{
        await ctx.answerCbQuery\(\);
        const sku = ctx.match\[1\];
        const method = ctx.match\[2\] \|\| 'saldo';
        const isOwner = db.owners.includes\(ctx.from\?\.id\);
        
        if \(method !== 'saldo' && !isOwner\) \{
            return ctx.reply\("❌ Metode pembayaran tidak valid."\);
        \}
        
        const state = userStates\[ctx.from\?\.id \|\| 0\];
        if \(!state \|\| state.step !== 'PREPAID_INPUT_NUMBER' \|\| state.data.product.buyer_sku_code !== sku\) \{
            return ctx.reply\("❌ Data transaksi tidak valid atau sudah kadaluarsa. Silakan ulangi pembelian."\);
        \}"""

# Wait, the exact code is:
prepaid_regex = r"""(      bot\.action\(\/\^pay_prepaid_\(\.\+\?\)\(\?:\_\(cash\|utang\|saldo\)\)\?\$\/, async \(ctx\) => \{\n.*?state\.data\.product\.buyer_sku_code !== sku\) \{\n            return ctx\.reply\("❌ Data transaksi tidak valid atau sudah kadaluarsa\. Silakan ulangi pembelian\."\);\n        \})"""

# Oh, let's just write it manually, it's safer.
