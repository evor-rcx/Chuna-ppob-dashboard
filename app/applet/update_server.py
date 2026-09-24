with open("server.ts", "r") as f:
    text = f.read()

# 1. Prepaid TG replacement
s1 = """                const waDetails = await getCustomerWaDetails(member, ctx.from?.id);
                const waProfileName = (waDetails && waDetails.waProfile && waDetails.waProfile !== '-') ? waDetails.waProfile : (member.name || '');
                const greetingWaName = waProfileName ? ` ${waProfileName}` : '';

                if (status === 'Pending') {
                    msg = `⏳ Hai Kak!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Produk  : ${product.product_name}
🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})

Chuna menunggu kabar baik dari Kakak! 😊`;

                    let emeraldBuffer: Buffer | null = null;
                    try {
                        const customerDisplayName = (waProfileName && waProfileName !== '-') ? waProfileName : (member.name || 'Pelanggan');
                        emeraldBuffer = await generateEmeraldConfirmationImage({
                            customerName: customerDisplayName,
                            serviceName: product.product_name,
                            targetNo: targetDisplay,
                            totalBayar: total,
                            waPhotoUrl: waDetails?.waPhotoUrl || null
                        });"""

r1 = """                const waDetails = await getCustomerWaDetails(member, ctx.from?.id);
                const customerDisplayName = getCustomerDisplayName(member, waDetails, ctx, member?.name);
                const greetingWaName = (customerDisplayName && customerDisplayName !== 'Pelanggan Setia') ? ` ${customerDisplayName}` : '';

                if (status === 'Pending') {
                    msg = `⏳ Hai Kak${greetingWaName}!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Produk  : ${product.product_name}
🎯 Tujuan   : ${targetDisplay} (${customerDisplayName !== 'Pelanggan Setia' ? customerDisplayName : (member.name || "-")})

Chuna menunggu kabar baik dari Kakak! 😊`;

                    let emeraldBuffer: Buffer | null = null;
                    try {
                        emeraldBuffer = await generateEmeraldConfirmationImage({
                            customerName: customerDisplayName,
                            serviceName: product.product_name,
                            targetNo: targetDisplay,
                            totalBayar: total,
                            waPhotoUrl: waDetails?.waPhotoUrl || null
                        });"""

# 2. Prepaid WA replacement
s2 = """                        if (status === 'Pending') {
                            const waPendingMsg = `⏳ Hai Kak${greetingWaName}!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Produk : ${product.product_name}
🎯 Tujuan : ${targetDisplay} (${member.name || "-"})

Chuna menunggu kabar baik dari Kakak! 😊`;

                            let emeraldBuffer: Buffer | null = null;
                            try {
                                const customerDisplayName = (waProfileName && waProfileName !== '-') ? waProfileName : (member.name || 'Pelanggan');
                                emeraldBuffer = await generateEmeraldConfirmationImage({
                                    customerName: customerDisplayName,
                                    serviceName: product.product_name,
                                    targetNo: targetDisplay,
                                    totalBayar: total,
                                    waPhotoUrl: waDetails?.waPhotoUrl || null
                                });"""

r2 = """                        if (status === 'Pending') {
                            const waPendingMsg = `⏳ Hai Kak${greetingWaName}!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Produk : ${product.product_name}
🎯 Tujuan : ${targetDisplay} (${customerDisplayName !== 'Pelanggan Setia' ? customerDisplayName : (member.name || "-")})

Chuna menunggu kabar baik dari Kakak! 😊`;

                            let emeraldBuffer: Buffer | null = null;
                            try {
                                emeraldBuffer = await generateEmeraldConfirmationImage({
                                    customerName: customerDisplayName,
                                    serviceName: product.product_name,
                                    targetNo: targetDisplay,
                                    totalBayar: total,
                                    waPhotoUrl: waDetails?.waPhotoUrl || null
                                });"""

# 3. Pascabayar TG replacement
s3 = """                const waDetails = await getCustomerWaDetails(member, ctx.from?.id);
                const waProfileName = (waDetails && waDetails.waProfile && waDetails.waProfile !== '-') ? waProfileName : (member.name || '');
                const greetingWaName = waProfileName ? ` ${waProfileName}` : '';

                if (status === 'Pending') {
                    msg = `⏳ Hai Kak!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan   : ${displayCustomerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

Chuna menunggu kabar baik dari Kakak! 😊`;

                    let emeraldBuffer: Buffer | null = null;
                    try {
                        const customerDisplayName = (waProfileName && waProfileName !== '-') ? waProfileName : (member.name || 'Pelanggan');
                        emeraldBuffer = await generateEmeraldConfirmationImage({
                            customerName: customerDisplayName,
                            serviceName: stateData.product.product_name,
                            targetNo: displayCustomerNo,
                            totalBayar: totalBayar,
                            waPhotoUrl: waDetails?.waPhotoUrl || null
                        });"""

r3 = """                const waDetails = await getCustomerWaDetails(member, ctx.from?.id);
                const customerDisplayName = getCustomerDisplayName(member, waDetails, ctx, payJson.data?.customer_name || member?.name);
                const greetingWaName = (customerDisplayName && customerDisplayName !== 'Pelanggan Setia') ? ` ${customerDisplayName}` : '';

                if (status === 'Pending') {
                    msg = `⏳ Hai Kak${greetingWaName}!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan   : ${displayCustomerNo} (${payJson.data?.customer_name || checkResult?.customer_name || (customerDisplayName !== 'Pelanggan Setia' ? customerDisplayName : "-")})

Chuna menunggu kabar baik dari Kakak! 😊`;

                    let emeraldBuffer: Buffer | null = null;
                    try {
                        emeraldBuffer = await generateEmeraldConfirmationImage({
                            customerName: customerDisplayName,
                            serviceName: stateData.product.product_name,
                            targetNo: displayCustomerNo,
                            totalBayar: totalBayar,
                            waPhotoUrl: waDetails?.waPhotoUrl || null
                        });"""

# 4. Pascabayar WA replacement
s4 = """                        if (status === 'Pending') {
                            const waPendingMsg = `⏳ Hai Kak${greetingWaName}!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan : ${displayCustomerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

Chuna menunggu kabar baik dari Kakak! 😊`;

                            let emeraldBuffer: Buffer | null = null;
                            try {
                                const customerDisplayName = (waProfileName && waProfileName !== '-') ? waProfileName : (member.name || 'Pelanggan');
                                emeraldBuffer = await generateEmeraldConfirmationImage({
                                    customerName: customerDisplayName,
                                    serviceName: stateData.product.product_name,
                                    targetNo: displayCustomerNo,
                                    totalBayar: totalBayar,
                                    waPhotoUrl: waDetails?.waPhotoUrl || null
                                });"""

r4 = """                        if (status === 'Pending') {
                            const waPendingMsg = `⏳ Hai Kak${greetingWaName}!

Pesanan Anda sedang diproses oleh sistem pusat E4 Store. Mohon tunggu beberapa saat, nanti akan kami kabari setelah selesai.

📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan : ${displayCustomerNo} (${payJson.data?.customer_name || checkResult?.customer_name || (customerDisplayName !== 'Pelanggan Setia' ? customerDisplayName : "-")})

Chuna menunggu kabar baik dari Kakak! 😊`;

                            let emeraldBuffer: Buffer | null = null;
                            try {
                                emeraldBuffer = await generateEmeraldConfirmationImage({
                                    customerName: customerDisplayName,
                                    serviceName: stateData.product.product_name,
                                    targetNo: displayCustomerNo,
                                    totalBayar: totalBayar,
                                    waPhotoUrl: waDetails?.waPhotoUrl || null
                                });"""

assert s1 in text, "s1 not found"
text = text.replace(s1, r1, 1)

assert s2 in text, "s2 not found"
text = text.replace(s2, r2, 1)

assert s3 in text, "s3 not found"
text = text.replace(s3, r3, 1)

assert s4 in text, "s4 not found"
text = text.replace(s4, r4, 1)

with open("server.ts", "w") as f:
    f.write(text)

print("All 4 replacements succeeded!")
