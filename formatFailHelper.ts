export function formatFailCheckMsg(productName: string, customerNo: string, rawMessage: string, waSocket: any, db: any) {
    if (rawMessage && rawMessage.toLowerCase().includes("ip anda tidak kami kenali")) {
        if (waSocket && db.waAnnouncementTarget) {
            waSocket.sendMessage(db.waAnnouncementTarget, { text: `🚨 *URGENT - IP TERTOLAK*\nAda IP server yang berubah dan ditolak Digiflazz saat cek tagihan:\n\n${rawMessage}` }).catch(()=>{});
        }
        return `❌ Maaf Kak, pengecekan tagihan untuk pesanan Anda gagal diproses.\n\nKemungkinan ada kesalahan data atau jaringan. Silakan cek kembali, atau hubungi Chuna untuk bantuan lebih lanjut.\n\nKeterangan : Sedang ada pemeliharaan\n📦 Produk  : ${productName}\n🎯 Tujuan   : ${customerNo}\n\nJangan khawatir, Kakak bisa mencoba ulang kapan saja.\n\nChuna siap bantu! 😊💪`;
    }
    return `❌ Pengecekan Gagal:\n${rawMessage}`;
}
