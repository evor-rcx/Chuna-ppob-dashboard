#!/bin/bash
# Remove GoPay section from Bot.tsx
sed -i '/<div className="pt-4 border-t border-slate-800\/50">/,/<\/div>\n      <\/div>\n    <\/PageContainer>/c\
      <\/div>\n    <\/PageContainer>' src/components/views/Bot.tsx

# Revert grid layout to 2 columns in Bot.tsx
sed -i 's/grid-cols-1 md:grid-cols-3/grid-cols-1 md:grid-cols-2/g' src/components/views/Bot.tsx

# Remove GoPay status box in Bot.tsx
sed -i '/<div className="bg-slate-800\/30 p-4 rounded-xl border border-slate-700\/50 flex flex-col gap-2">/,/<\/div>\n        <\/div>\n\n        <div className="pt-4 border-t border-slate-800\/50">/c\
        <\/div>\n\n        <div className="pt-4 border-t border-slate-800\/50">' src/components/views/Bot.tsx

# Remove Gopay state from Bot.tsx
sed -i '/const \[gopayStatus, setGopayStatus\]/d' src/components/views/Bot.tsx
sed -i '/const \[gopayMerchantId, setGopayMerchantId\]/d' src/components/views/Bot.tsx
sed -i '/const \[gopayClientKey, setGopayClientKey\]/d' src/components/views/Bot.tsx
sed -i '/const \[gopayLoading, setGopayLoading\]/d' src/components/views/Bot.tsx

# Remove Gopay fetch status from Bot.tsx
sed -i '/fetch("\/api\/gopay\/status")/d' src/components/views/Bot.tsx
sed -i '/.then(data => setGopayStatus(data.status))/d' src/components/views/Bot.tsx
sed -i '/.catch(() => setGopayStatus("Disconnected"))/d' src/components/views/Bot.tsx

# Remove GoPay routes from server.ts
sed -i '/\/\/ --- GoPay API Routes ---/,/\/\/ --- Digiflazz API Routes ---/c\
  \/\/ --- Digiflazz API Routes ---' server.ts
