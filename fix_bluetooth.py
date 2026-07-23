import re

with open('/app/applet/src/utils/printReceipt.ts', 'r', encoding='utf-8') as f:
    text = f.read()

old_request = """    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [
        { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
        { services: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'] },
        { namePrefix: 'MPT' },
        { namePrefix: 'MTP' },
        { namePrefix: 'RPP' },
        { namePrefix: 'Blue' },
        { namePrefix: 'S11' },
        { namePrefix: 'YSC' }
      ],
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', 
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
      ],
      acceptAllDevices: true
    });"""

new_request = """    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', 
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        '0000e000-0000-1000-8000-00805f9b34fb'
      ]
    });"""

text = text.replace(old_request, new_request)

with open('/app/applet/src/utils/printReceipt.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Bluetooth requestDevice fixed.")
