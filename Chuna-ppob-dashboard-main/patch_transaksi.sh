#!/bin/bash
sed -i 's/const transactions = \[/const [transactions, setTransactions] = useState<any[]>(\[\]);/g' src/components/views/Transaksi.tsx
sed -i 's/{ id: '\''#TRX-901'\''.*//g' src/components/views/Transaksi.tsx
sed -i 's/{ id: '\''#TRX-902'\''.*//g' src/components/views/Transaksi.tsx
sed -i 's/{ id: '\''#TRX-903'\''.*//g' src/components/views/Transaksi.tsx
sed -i 's/];/useEffect(() => {\n    fetch("\/api\/transactions").then(res => res.json()).then(data => setTransactions(data.transactions || [])).catch(() => {});\n  }, []);/g' src/components/views/Transaksi.tsx
sed -i 's/import { PageContainer }/import { useState, useEffect } from "react";\nimport { PageContainer }/g' src/components/views/Transaksi.tsx
