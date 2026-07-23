import re

with open('server.ts', 'r') as f:
    code = f.read()

webhook_old = r"""        const data = payload\.data;
        const ref_id = data\.ref_id;
        const status = data\.status;
        
        const db = readDB\(\);
        const txIndex = db\.transactions\.findIndex\(\(t\) => t\.id === ref_id\);
        
        if \(txIndex >= 0\) \{
            const tx = db\.transactions\[txIndex\];
            
            if \(tx\.status === 'Pending' && \(status === 'Sukses' \|\| status === 'Gagal'\)\) \{
                tx\.status = status;
                
                const memberIndex = db\.members\.findIndex\(\(m\) => m\.id === tx\.memberId\);
                let member = null;
                if \(memberIndex >= 0\) \{
                    member = db\.members\[memberIndex\];"""

webhook_new = """        const data = payload.data;
        const ref_id = data.ref_id;
        const status = data.status;
        
        // Use closure variables instead of readDB() to prevent ghost balance bug!
        const txIndex = transactions.findIndex((t) => t.id === ref_id);
        
        if (txIndex >= 0) {
            const tx = transactions[txIndex];
            
            if (tx.status === 'Pending' && (status === 'Sukses' || status === 'Gagal')) {
                tx.status = status;
                
                const memberIndex = members.findIndex((m) => m.id === tx.memberId);
                let member = null;
                if (memberIndex >= 0) {
                    member = members[memberIndex];"""

code = re.sub(webhook_old, webhook_new, code)

with open('server.ts', 'w') as f:
    f.write(code)

print("Webhook closure patched")
