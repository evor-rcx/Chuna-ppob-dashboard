import re

with open('/app/applet/server.ts', 'r') as f:
    text = f.read()

text = re.sub(
    r'"📝 PENDAFTARAN AKUN\n\nOke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong."',
    r'`📝 PENDAFTARAN AKUN\n\nOke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.`',
    text
)

text = re.sub(
    r'"📸 \*Kirimkan gambar atau video \(dengan caption\) untuk dijadikan Story WA:\*\n\nKirim sebagai Document/File di Telegram jika ingin kualitas asli \(HD/tanpa pecah\)\."',
    r'`📸 *Kirimkan gambar atau video (dengan caption) untuk dijadikan Story WA:*\n\nKirim sebagai Document/File di Telegram jika ingin kualitas asli (HD/tanpa pecah).`',
    text
)

with open('/app/applet/server.ts', 'w') as f:
    f.write(text)
