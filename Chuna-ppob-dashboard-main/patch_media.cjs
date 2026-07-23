const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// replace bot.hears("📢 Buat Pengumuman") text to tell them they can send text, photo, or video
code = code.replace(/Kirimkan teks pengumuman yang ingin dikirimkan ke target \*\$\{target\}\*:\\n\\n\(Bisa multi-baris\)/, 
"Kirimkan teks, gambar, atau video (dengan caption) yang ingin dikirimkan ke target *\${target}*:\\n\\n(Bisa multi-baris)");

// Add bot.on(["photo", "video", "document"])
const mediaHandler = `
      bot.on(["photo", "video", "document"], async (ctx, next) => {
          const userId = ctx.from.id;
          const state = userStates[userId];
          
          if (state && state.step === 'AWAITING_ANNOUNCEMENT_TEXT') {
              const targetAnnounce = db.waAnnouncementTarget;
              if (!targetAnnounce) {
                  await ctx.reply("❌ Target WA belum diatur!");
                  delete userStates[userId];
                  return;
              }
              
              let fileId;
              let mediaType;
              let mimetype;
              let fileName;
              
              if (ctx.message.photo) {
                  fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                  mediaType = 'image';
              } else if (ctx.message.video) {
                  fileId = ctx.message.video.file_id;
                  mediaType = 'video';
              } else if (ctx.message.document) {
                  fileId = ctx.message.document.file_id;
                  mediaType = 'document';
                  mimetype = ctx.message.document.mime_type;
                  fileName = ctx.message.document.file_name || 'document';
              }
              
              const caption = ctx.message.caption || "";
              
              try {
                  const fileLink = await ctx.telegram.getFileLink(fileId);
                  const response = await fetch(fileLink.href);
                  const arrayBuffer = await response.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  
                  // Save to disk
                  const ext = fileName ? fileName.split('.').pop() : (mediaType === 'image' ? 'jpg' : 'mp4');
                  const localPath = 'announcement_media.' + ext;
                  fs.writeFileSync(localPath, buffer);
                  
                  db.waAnnouncementText = caption;
                  db.waAnnouncementMedia = localPath;
                  db.waAnnouncementMediaType = mediaType;
                  if (mimetype) db.waAnnouncementMime = mimetype;
                  if (fileName) db.waAnnouncementFileName = fileName;
                  db.waAnnouncementEnabled = true;
                  writeDB(db);
                  
                  await ctx.reply("✅ Media pengumuman berhasil disimpan dan diaktifkan (otomatis kirim setiap 1 jam). Sedang mencoba mengirim percobaan pertama...");
                  delete userStates[userId];
                  
                  if (waSocket) {
                      try {
                          let msgOpt = {};
                          if (mediaType === 'image') msgOpt = { image: buffer, caption: caption };
                          else if (mediaType === 'video') msgOpt = { video: buffer, caption: caption };
                          else if (mediaType === 'document') msgOpt = { document: buffer, caption: caption, mimetype: mimetype, fileName: fileName };
                          
                          await waSocket.sendMessage(targetAnnounce, msgOpt);
                      } catch (err) {
                          await ctx.reply("⚠️ Gagal mengirim percobaan pertama: " + err.message);
                      }
                  } else {
                      await ctx.reply("⚠️ WhatsApp belum terhubung. Pengumuman akan dikirim saat WA terhubung.");
                  }
              } catch (e) {
                  await ctx.reply("❌ Gagal mendownload atau memproses media: " + e.message);
              }
              return;
          }
          
          return next();
      });
`;

code = code.replace(/bot\.on\("text", async \(ctx, next\) => \{/, mediaHandler + "\n      bot.on(\"text\", async (ctx, next) => {");

// Update intervalCode to handle media
code = code.replace(/setInterval\(async \(\) => \{[\s\S]*?\}, 60 \* 60 \* 1000\);/,
`setInterval(async () => {
    if (db.waAnnouncementEnabled && db.waAnnouncementTarget && waSocket) {
        try {
            let msgOpt = {};
            if (db.waAnnouncementMedia && fs.existsSync(db.waAnnouncementMedia)) {
                const buffer = fs.readFileSync(db.waAnnouncementMedia);
                const caption = db.waAnnouncementText || "";
                if (db.waAnnouncementMediaType === 'image') msgOpt = { image: buffer, caption: caption };
                else if (db.waAnnouncementMediaType === 'video') msgOpt = { video: buffer, caption: caption };
                else if (db.waAnnouncementMediaType === 'document') msgOpt = { document: buffer, caption: caption, mimetype: db.waAnnouncementMime, fileName: db.waAnnouncementFileName };
            } else if (db.waAnnouncementText) {
                msgOpt = { text: db.waAnnouncementText };
            } else {
                return; // Nothing to send
            }
            await waSocket.sendMessage(db.waAnnouncementTarget, msgOpt);
            console.log("Auto announcement sent to " + db.waAnnouncementTarget);
        } catch (e) {
            console.error("Failed to send auto announcement:", e.message);
        }
    }
}, 60 * 60 * 1000);`);

// Update text handler to clear media if they just send text
code = code.replace(/db\.waAnnouncementText = text;\n\s*db\.waAnnouncementEnabled = true;\n\s*writeDB\(db\);/m,
`db.waAnnouncementText = text;
                db.waAnnouncementMedia = null;
                db.waAnnouncementMediaType = null;
                db.waAnnouncementEnabled = true;
                writeDB(db);`);

fs.writeFileSync('server.ts', code);
