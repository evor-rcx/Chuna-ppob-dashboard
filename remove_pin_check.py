import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove pollMessageDeletion function
poll_regex = r"async function pollMessageDeletion\(.*?\n\}"
text = re.sub(poll_regex, "", text, flags=re.DOTALL)

# Replace ASK_PIN_PREPAID block
old_ask_prepaid = r'''                case 'ASK_PIN_PREPAID': {
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
                }'''

new_ask_prepaid = r'''                case 'ASK_PIN_PREPAID': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }
                    await ctx.reply("✅ Yey! PIN-nya benar. Chuna langsung proses transaksinya sekarang ya sayang! 🚀✨\n*(Demi keamanan, pesan berisi PIN-mu jangan lupa dihapus sendiri ya)*", { parse_mode: 'Markdown' });
                    const sd = state.data;
                    delete userStates[userId];
                    await processPrepaidPayment(ctx, sd.sku, sd.method, sd, sd.memberId || `MBR-${userId}`);
                    return;
                }'''
text = text.replace(old_ask_prepaid, new_ask_prepaid)

# Replace ASK_PIN_PASCA block
old_ask_pasca = r'''                case 'ASK_PIN_PASCA': {
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
                }'''

new_ask_pasca = r'''                case 'ASK_PIN_PASCA': {
                    const pinEntered = text.trim();
                    const regUser = registeredUsers[userId];
                    if (!regUser || regUser.pin !== pinEntered) {
                        return ctx.reply("😡 HMM?! PIN-NYA SALAH! Hayoo, kamu siapa?! Jangan sembarangan pakai akun orang ya! Chuna gigit nih kalau berani macam-macam! 🔪👿");
                    }
                    await ctx.reply("✅ Yey! PIN-nya benar. Chuna langsung proses transaksinya sekarang ya sayang! 🚀✨\n*(Demi keamanan, pesan berisi PIN-mu jangan lupa dihapus sendiri ya)*", { parse_mode: 'Markdown' });
                    const sd = state.data;
                    delete userStates[userId];
                    await processPascaPayment(ctx, sd.ref_id, sd.method, sd, sd.memberId || `MBR-${userId}`);
                    return;
                }'''
text = text.replace(old_ask_pasca, new_ask_pasca)

# Remove WAIT_DELETE states
old_wait_states = r'''                case 'WAIT_DELETE_PIN_PREPAID':
                case 'WAIT_DELETE_PIN_PASCA':
                    return ctx.reply("Hapus pesan PIN kamu dulu ya sayang, baru bisa lanjut! 🥺💕");'''
text = text.replace(old_wait_states, "")

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("PIN check removed.")
