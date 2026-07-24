with open('server.ts', 'r') as f:
    code = f.read()

# Replace actual newline character followed by another newline and 'Saldo' inside single quotes.
# Wait, let's just use regex.
import re
code = re.sub(r"let refundMsg = method !== 'cash' \? '\n\nSaldo telah dikembalikan\.' : '';", r"let refundMsg = method !== 'cash' ? '\\n\\nSaldo telah dikembalikan.' : '';", code)

with open('server.ts', 'w') as f:
    f.write(code)
