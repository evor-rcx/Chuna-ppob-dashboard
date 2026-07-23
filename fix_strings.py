import re
with open('/app/applet/server.ts', 'r') as f:
    text = f.read()

text = text.replace('"📝 PENDAFTARAN AKUN\\n\\nOke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong."', '`📝 PENDAFTARAN AKUN\\n\\nOke kak! Langkah pertama, kasih tau Chuna Username yang kakak mau dong.`')

# Let's fix line 2039. What is at 2039?
# 2039: error TS1002: Unterminated string literal.
