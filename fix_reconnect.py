import re

with open('server.ts', 'r') as f:
    code = f.read()

pattern = r"""    waSocket\.ev\.on\("connection\.update", \(update\) => \{
      const \{ connection, lastDisconnect \} = update;
      if \(connection === "close"\) \{
        const errMsg = \(lastDisconnect\?\.error as any\)\?\.message;
        const statusCode = \(lastDisconnect\?\.error as any\)\?\.output\?\.statusCode;
        waStatus = "Disconnected: " \+ \(errMsg \|\| "Closed"\);
        console\.log\("WA connection closed", errMsg, "statusCode:", statusCode\);
        
        // 401 = LoggedOut, 403 = ConnectionReplaced, 405 = BadSession
        // If logged out from device, we must delete auth
        if \(statusCode === 401\) \{
           try \{ fs\.rmSync\(path\.join\(process\.cwd\(\), "wa_auth"\), \{ recursive: true, force: true \}\); \} catch \(e\) \{ \}
           waSocket = null;
           console\.log\("WA Logged out by device\. Auth deleted\."\);
        \} else if \(statusCode === 403\) \{
           console\.log\("WA connection replaced \(opened somewhere else\)\. Not reconnecting automatically\."\);
           // Do not delete auth, but also don't automatically reconnect immediately to avoid loop
        \} else \{
           if \(statusCode === 405\) \{
               console\.log\("WA bad session, deleting auth and reconnecting\.\.\."\);
               try \{ fs\.rmSync\(path\.join\(process\.cwd\(\), "wa_auth"\), \{ recursive: true, force: true \}\); \} catch \(e\) \{ \}
           \}
           // Try to reconnect infinitely, but with backoff
           waReconnectAttempts\+\+;
           let backoff = Math\.min\(waReconnectAttempts \* 2000, 10000\); // max 10 seconds backoff
           console\.log\(`Reconnecting WA in \$\{backoff/1000\} seconds\.\.\.`\);
           setTimeout\(startWaSocket, backoff\);
        \}
      \} else if \(connection === "open"\) \{
        waReconnectAttempts = 0;
        const userJid = waSocket\?\.user\?\.id \|\| "";
        const phoneNum = userJid\.split\(':'\)\[0\] \|\| "Connected";
        const pushName = waSocket\?\.user\?\.name \|\| "";
        waStatus = pushName \? `Connected as \$\{pushName\} \(\$\{phoneNum\}\)` : `Connected as \$\{phoneNum\}`;
        waPairingCode = "";
        console\.log\("WA connection opened"\);
      \}
    \}\);"""

new_code = """    waSocket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const errMsg = (lastDisconnect?.error as any)?.message;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        waStatus = "Disconnected: " + (errMsg || "Closed");
        console.log("WA connection closed", errMsg, "statusCode:", statusCode);
        
        // Always try to reconnect unless it's explicitly logged out (401)
        if (statusCode === 401) {
           try { fs.rmSync(path.join(process.cwd(), "wa_auth"), { recursive: true, force: true }); } catch (e) { }
           waSocket = null;
           console.log("WA Logged out by device. Auth deleted.");
        } else {
           if (statusCode === 405) {
               console.log("WA bad session, deleting auth and reconnecting...");
               try { fs.rmSync(path.join(process.cwd(), "wa_auth"), { recursive: true, force: true }); } catch (e) { }
           }
           // Reconnect
           waReconnectAttempts++;
           let backoff = Math.min(waReconnectAttempts * 2000, 10000);
           console.log(`Reconnecting WA in ${backoff/1000} seconds...`);
           setTimeout(startWaSocket, backoff);
        }
      } else if (connection === "open") {
        waReconnectAttempts = 0;
        const userJid = waSocket?.user?.id || "";
        const phoneNum = userJid.split(':')[0] || "Connected";
        const pushName = waSocket?.user?.name || "";
        waStatus = pushName ? `Connected as ${pushName} (${phoneNum})` : `Connected as ${phoneNum}`;
        waPairingCode = "";
        console.log("WA connection opened");
      }
    });"""

if pattern in code:
    code = code.replace(pattern, new_code)
    with open('server.ts', 'w') as f:
        f.write(code)
    print("Replaced!")
else:
    print("Not found!")
