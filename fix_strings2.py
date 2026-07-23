with open('/app/applet/server.ts', 'r') as f:
    text = f.read()

# Fix string 1
text = text.replace('"📝 PENDAFTARAN AKUN\\n\\nOke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong."', '`📝 PENDAFTARAN AKUN\\n\\nOke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.`')

# Fix string 2
text = text.replace('"📸 *Kirimkan gambar atau video (dengan caption) untuk dijadikan Story WA:*\\n\\nKirim sebagai Document/File di Telegram jika ingin kualitas asli (HD/tanpa pecah)."', '`📸 *Kirimkan gambar atau video (dengan caption) untuk dijadikan Story WA:*\\n\\nKirim sebagai Document/File di Telegram jika ingin kualitas asli (HD/tanpa pecah).`')

with open('/app/applet/server.ts', 'w') as f:
    f.write(text)
