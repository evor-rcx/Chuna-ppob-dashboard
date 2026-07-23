with open('server.ts', 'r') as f:
    code = f.read()

# Replace the broken string
code = code.replace("let refundMsg = method !== 'cash' ? '\n\nSaldo telah dikembalikan.' : '';", r"let refundMsg = method !== 'cash' ? '\n\nSaldo telah dikembalikan.' : '';")

with open('server.ts', 'w') as f:
    f.write(code)
