import re

for filename in ['src/components/views/Saldo.tsx', 'src/components/views/MemberOffline.tsx']:
    with open(filename, 'r') as f:
        code = f.read()
    
    code = code.replace('Reset PIN member ini ke 123456?', 'Reset PIN member ini? Bot akan mengirim pesan untuk meminta member membuat PIN baru.')
    code = code.replace('Member akan diminta membuat ulang PIN atau menggunakan 123456.', '')
    
    with open(filename, 'w') as f:
        f.write(code)

print("Updated prompt messages in frontend")
