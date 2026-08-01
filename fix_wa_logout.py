import re

with open('server.ts', 'r') as f:
    code = f.read()

pattern = r"""        // Always try to reconnect unless it's explicitly logged out \(401\)
        if \(statusCode === 401\) \{
           try \{ fs\.rmSync\(path\.join\(process\.cwd\(\), "wa_auth"\), \{ recursive: true, force: true \}\); \} catch \(e\) \{ \}
           waSocket = null;
           console\.log\("WA Logged out by device\. Auth deleted\."\);
        \} else \{
           if \(statusCode === 405\) \{
               console\.log\("WA bad session, deleting auth and reconnecting\.\.\."\);
               try \{ fs\.rmSync\(path\.join\(process\.cwd\(\), "wa_auth"\), \{ recursive: true, force: true \}\); \} catch \(e\) \{ \}
           \}"""

new_code = """        // Avoid deleting auth automatically to prevent accidental logouts
        if (statusCode === 401) {
           console.log("WA Logged out by device. NOT deleting auth automatically. Please use the Reset button if needed.");
           waSocket = null;
        } else {
           if (statusCode === 405) {
               console.log("WA bad session. Not deleting auth automatically...");
           }"""

if pattern in code:
    code = code.replace(pattern, new_code)
    with open('server.ts', 'w') as f:
        f.write(code)
    print("Replaced!")
else:
    print("Not found! Let's do a more robust replace.")
