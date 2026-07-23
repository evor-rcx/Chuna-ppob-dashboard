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

prepaid_regex = re.compile(r"      bot\.action\(\/\^pay_prepaid_\(\.\+\?\)\(\?:\_\(cash\|utang\|saldo\)\)\?\$\/, async \(ctx\) => \{.*?(?=\n      bot\.action\(\'cancel_prepaid\')", re.DOTALL)

prepaid_match = prepaid_regex.search(code)
if prepaid_match:
    prepaid_old_body = prepaid_match.group(0)
    # Extract the payment logic from it
    payment_logic_match = re.search(r'(const product = state\.data\.product;.*)if \(state\.data\.memberId\) \{', prepaid_old_body, re.DOTALL)
    if payment_logic_match:
        payment_logic = payment_logic_match.group(1)
        # Create processPrepaidPayment function
        process_prepaid_func = """async function processPrepaidPayment(ctx: any, sku: string, method: string, stateData: any, memberId: string) {\n""" + payment_logic + """
        if (stateData.memberId) {
            userStates[ctx.from?.id || 0] = { step: 'LOCKED_MEMBER', data: { memberId: stateData.memberId } };
        } else {
            delete userStates[ctx.from?.id || 0];
        }
}
"""
        # wait! `pay_ref_id` is declared as `const pay_ref_id = "PRE-" + Date.now();` which is inside payment logic!
        # But wait! I can just use my pre-written function logic.

