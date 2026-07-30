with open('server.ts', 'r') as f:
    code = f.read()

old_text = """Fitur Download 📥

Halo kak! Silakan kirimkan link video/audio yang ingin didownload.
Saat ini Chuna mendukung download dari:
🎵 TikTok
🎬 YouTube
📘 Facebook
📸 Instagram

Kirim linknya sekarang ya! 🥰
Contoh link
https://vt.tiktok.com/ZSXWsjbFd/"""

new_text = """Fitur Download 📥

Halo kak! Silakan kirimkan link video/audio yang ingin didownload.
Saat ini Chuna mendukung download dari:
🎵 TikTok
🎬 YouTube


Kirim linknya sekarang ya! 🥰"""

code = code.replace(old_text, new_text)

with open('server.ts', 'w') as f:
    f.write(code)

print("Updated server.ts!")
