with open('/app/applet/server.ts', 'r') as f:
    text = f.read()

text = text.replace("fetch(url, { timeout: 3000 })", "fetch(url, { signal: AbortSignal.timeout(3000) })")

with open('/app/applet/server.ts', 'w') as f:
    f.write(text)
