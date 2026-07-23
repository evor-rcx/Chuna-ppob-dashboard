with open('/app/applet/src/utils/printReceipt.ts', 'r') as f:
    content = f.read()

content = content.replace("!navigator.bluetooth", "!(navigator as any).bluetooth")
content = content.replace("navigator.bluetooth.requestDevice", "(navigator as any).bluetooth.requestDevice")

with open('/app/applet/src/utils/printReceipt.ts', 'w') as f:
    f.write(content)
