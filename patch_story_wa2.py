import re

with open('/app/applet/server.ts', 'r') as f:
    content = f.read()

# Add makeInMemoryStore to import if not present
if "makeInMemoryStore" not in content:
    content = re.sub(
        r'import \{ (.*?) \} from "@whiskeysockets/baileys";',
        r'import { \1, makeInMemoryStore } from "@whiskeysockets/baileys";',
        content
    )

# Add store initialization
if "const store =" not in content:
    store_init = """
const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) as any });
try { store.readFromFile(path.join(process.cwd(), "wa_store.json")); } catch(e) {}
setInterval(() => {
    try { store.writeToFile(path.join(process.cwd(), "wa_store.json")); } catch(e) {}
}, 10_000);
"""
    content = re.sub(r'let waSocket: ReturnType<typeof makeWASocket> \| null = null;', store_init + r'\nlet waSocket: ReturnType<typeof makeWASocket> | null = null;', content)

# Bind store
if "store.bind" not in content:
    content = content.replace("waSocket.ev.on(\"creds.update\", saveCreds);", "waSocket.ev.on(\"creds.update\", saveCreds);\n    store.bind(waSocket.ev);")

# Add to owner menu
if "📸 Buat Story WA" not in content:
    content = content.replace('const ownerMenu = ["📒 Cek Utang Member", "📝 Tambah Member", "👑 List Member", "💳 Saldo Pusat", "⚙️ Pengaturan"];', 'const ownerMenu = ["📒 Cek Utang Member", "📝 Tambah Member", "👑 List Member", "💳 Saldo Pusat", "⚙️ Pengaturan", "📢 Pengumuman WA", "📸 Buat Story WA"];')

# Add bot.hears("📸 Buat Story WA")
hears_story = """
      bot.hears("📸 Buat Story WA", async (ctx) => {
          if (!db.owners.includes(ctx.from.id)) return;
          userStates[ctx.from.id] = { step: 'AWAITING_STORY_MEDIA', data: {} };
          await ctx.reply("📸 *Kirimkan gambar atau video (dengan caption) untuk dijadikan Story WA:*\\n\\nKirim sebagai Document/File di Telegram jika ingin kualitas asli (HD/tanpa pecah).", { parse_mode: 'Markdown' });
      });
"""
if "bot.hears(\"📸 Buat Story WA\"" not in content:
    content = content.replace('bot.hears("📝 Tambah Member", async (ctx) => {', hears_story + '\n      bot.hears("📝 Tambah Member", async (ctx) => {')


# Add handling for media
media_handling = """
          if (state && state.step === 'AWAITING_STORY_MEDIA') {
              if (!waSocket) {
                  await ctx.reply("❌ WhatsApp belum terhubung!");
                  delete userStates[userId];
                  return;
              }
              await ctx.reply("⏳ Mendownload media dan menyiapkan pengiriman...");
              try {
                  let fileId, mediaType, mimetype, fileName;
                  const msg = ctx.message as any;
                  if (msg.photo) {
                      fileId = msg.photo[msg.photo.length - 1].file_id;
                      mediaType = 'image';
                  } else if (msg.video) {
                      fileId = msg.video.file_id;
                      mediaType = 'video';
                  } else if (msg.document) {
                      fileId = msg.document.file_id;
                      mediaType = 'document';
                      mimetype = msg.document.mime_type;
                      fileName = msg.document.file_name || 'document';
                  }

                  const caption = msg.caption || "";
                  const fileLink = await ctx.telegram.getFileLink(fileId);
                  const response = await fetch(fileLink.href);
                  const arrayBuffer = await response.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);

                  // Get all contacts from store for statusJidList
                  const contacts = Object.values(store.contacts || {});
                  const jidList = contacts.map((c: any) => c.id).filter((id: string) => id && id.endsWith('@s.whatsapp.net'));
                  
                  // Also include the owner's own JID just in case
                  const me = waSocket.user?.id?.split(':')[0] + '@s.whatsapp.net';
                  if (me && !jidList.includes(me)) jidList.push(me);
                  
                  // Add registered members WA
                  Object.values(db.registeredUsers || {}).forEach((u: any) => {
                      if (u.wa) {
                          let clean = u.wa.replace(/\D/g, "");
                          if (clean.startsWith("0")) clean = "62" + clean.substring(1);
                          let memberJid = clean + "@s.whatsapp.net";
                          if (!jidList.includes(memberJid)) jidList.push(memberJid);
                      }
                  });

                  let msgOpt: any = {};
                  if (mediaType === 'image') msgOpt = { image: buffer, caption: caption };
                  else if (mediaType === 'video') msgOpt = { video: buffer, caption: caption };
                  else if (mediaType === 'document') {
                      if (mimetype?.includes('video')) msgOpt = { video: buffer, caption: caption };
                      else msgOpt = { image: buffer, caption: caption };
                  }

                  await waSocket.sendMessage('status@broadcast', msgOpt, { statusJidList: jidList });
                  
                  await ctx.reply("✅ Story WA berhasil diunggah!");
                  delete userStates[userId];
              } catch (err: any) {
                  await ctx.reply("❌ Gagal mengunggah Story WA: " + err.message);
                  delete userStates[userId];
              }
              return;
          }
"""

if "state.step === 'AWAITING_STORY_MEDIA'" not in content:
    content = content.replace("if (state && state.step === 'AWAITING_ANNOUNCEMENT_TEXT') {", media_handling + "\n                    if (state && state.step === 'AWAITING_ANNOUNCEMENT_TEXT') {")

with open('/app/applet/server.ts', 'w') as f:
    f.write(content)
