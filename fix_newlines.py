import re
with open('/app/applet/server.ts', 'r') as f:
    text = f.read()

# I will replace some obvious missing newlines.
replacements = {
    "PENDAFTARAN AKUNOke": "PENDAFTARAN AKUN\\n\\nOke",
    "📝 MASUKKAN USERNAME MEMBER BARU:": "📝 MASUKKAN USERNAME MEMBER BARU:",
    "💡 *TIPS OTOMATIS HARGA:*Kamu": "💡 *TIPS OTOMATIS HARGA:*\\nKamu",
    "(Bisa multi-baris)💡": "(Bisa multi-baris)\\n\\n💡",
    "ke target *${target}*:(Bisa": "ke target *${target}*:\\n(Bisa",
    "Story WA:*Kirim": "Story WA:*\\n\\nKirim"
}
for k, v in replacements.items():
    text = text.replace(k, v)

with open('/app/applet/server.ts', 'w') as f:
    f.write(text)
