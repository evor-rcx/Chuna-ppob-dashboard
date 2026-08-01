import re

with open('src/components/views/Bot.tsx', 'r') as f:
    code = f.read()

state_add = """  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [gmailStatus, setGmailStatus] = useState('Checking...');
  const [gmailLoading, setGmailLoading] = useState(false);"""

code = code.replace("const [waLoading, setWaLoading] = useState(false);", "const [waLoading, setWaLoading] = useState(false);\n" + state_add)

fetch_add = """
      fetch('/api/gmail/status')
        .then(res => res.json())
        .then(data => {
          setGmailStatus(data.status);
          if (data.email) {
            setGmailEmail(prev => prev === '' ? data.email : prev);
          }
        })
        .catch(() => setGmailStatus('Disconnected'));"""

code = code.replace("fetch('/api/wa/status')", fetch_add + "\n      fetch('/api/wa/status')")

handle_add = """
  const handleUpdateGmail = async () => {
    if (!gmailEmail || !gmailPassword) {
      alert("Masukkan Email dan App Password Gmail terlebih dahulu!");
      return;
    }
    setGmailLoading(true);
    setGmailStatus('Connecting...');
    try {
      const response = await fetch('/api/gmail/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gmailEmail, password: gmailPassword })
      });
      const data = await response.json();
      if (data.success) {
        setGmailStatus('Configured');
        alert("Gmail berhasil dihubungkan!");
      } else {
        setGmailStatus('Error');
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      setGmailStatus('Error');
      alert("Terjadi kesalahan saat menghubungkan Gmail.");
    } finally {
      setGmailLoading(false);
    }
  };
"""

code = code.replace("const handleResetWA = async () => {", handle_add + "\n  const handleResetWA = async () => {")

ui_status_add = """          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">✉️</div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Status Gmail</div>
            </div>
            <div className={`text-sm font-medium break-words ${gmailStatus?.includes('Configured') ? 'text-green-400' : 'text-amber-400'}`}>
              {gmailStatus}
            </div>
          </div>"""

# Change grid cols from md:grid-cols-2 to md:grid-cols-3
code = code.replace('className="grid grid-cols-1 md:grid-cols-2 gap-4"', 'className="grid grid-cols-1 md:grid-cols-3 gap-4"')
code = code.replace('<div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">\n            <div className="flex items-center gap-3">\n              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">✈️</div>', ui_status_add + '\n          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">\n            <div className="flex items-center gap-3">\n              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">✈️</div>')


ui_gmail_add = """
        <div className="pt-4 border-t border-slate-800/50">
          <h3 className="text-sm font-medium text-white mb-4">Pengaturan Gmail Bot</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alamat Email Gmail</label>
            <input 
              type="email" 
              placeholder="contoh@gmail.com" 
              value={gmailEmail}
              onChange={(e) => setGmailEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">App Password Gmail (16 Karakter)</label>
            <input 
              type="password" 
              placeholder="xxxx xxxx xxxx xxxx" 
              value={gmailPassword}
              onChange={(e) => setGmailPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Gunakan Sandi Aplikasi (App Password) dari pengaturan keamanan akun Google Anda.
            </p>
          </div>
          <button 
            onClick={handleUpdateGmail}
            disabled={gmailLoading}
            className="w-full bg-slate-800 border border-slate-700 text-white font-medium py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors mt-4 disabled:opacity-50"
          >
            {gmailLoading ? 'Menghubungkan...' : 'Update Konfigurasi Gmail'}
          </button>
        </div>"""

code = code.replace('<div className="pt-4 border-t border-slate-800/50">\n          <h3 className="text-sm font-medium text-white mb-4">Pengaturan WhatsApp (Baileys)</h3>', ui_gmail_add + '\n        <div className="pt-4 border-t border-slate-800/50">\n          <h3 className="text-sm font-medium text-white mb-4">Pengaturan WhatsApp (Baileys)</h3>')

with open('src/components/views/Bot.tsx', 'w') as f:
    f.write(code)

print("Updated Bot.tsx")
