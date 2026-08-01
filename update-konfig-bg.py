import re

with open('src/components/views/Konfig.tsx', 'r') as f:
    code = f.read()

# Add state
state_pattern = r"""  const \[loading, setLoading\] = useState\(false\);"""
new_state = """  const [loading, setLoading] = useState(false);
  const [bgType, setBgType] = useState(localStorage.getItem('chuna_bg_type') || '');
  const [bgUrl, setBgUrl] = useState(localStorage.getItem('chuna_bg_url') || '');"""

if state_pattern in code:
    code = re.sub(state_pattern, new_state, code)

# Add UI
ui_pattern = r"""        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">🎨</div>
            <div className="text-\[10px\] uppercase text-slate-500 font-bold">Tema Tampilan</div>
          </div>"""

new_ui = """        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">🎨</div>
            <div className="text-[10px] uppercase text-slate-500 font-bold">Tema Tampilan & Latar Belakang</div>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs text-slate-400">Mode Tema</label>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  localStorage.setItem('chuna_theme', 'dark');
                  document.documentElement.classList.remove('theme-light');
                }}
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                🌙 Mode Gelap
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('chuna_theme', 'light');
                  document.documentElement.classList.add('theme-light');
                }}
                className="flex-1 bg-slate-200 border border-slate-300 text-slate-800 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                data-no-invert
              >
                ☀️ Mode Terang
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2 border-t border-slate-700/50 pt-3">
            <label className="text-xs text-slate-400">Tipe Latar Belakang</label>
            <select
              value={bgType}
              onChange={(e) => {
                setBgType(e.target.value);
                localStorage.setItem('chuna_bg_type', e.target.value);
                window.dispatchEvent(new Event('chuna_bg_update'));
              }}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none"
            >
              <option value="">Tidak ada (Warna solid)</option>
              <option value="image">Gambar (Image)</option>
              <option value="video">Video</option>
            </select>
          </div>

          {bgType && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400">URL Gambar / Video</label>
              <input
                type="text"
                placeholder={`Masukkan URL ${bgType === 'image' ? 'gambar' : 'video'}...`}
                value={bgUrl}
                onChange={(e) => {
                  setBgUrl(e.target.value);
                  localStorage.setItem('chuna_bg_url', e.target.value);
                  window.dispatchEvent(new Event('chuna_bg_update'));
                }}
                className="w-full bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none"
              />
            </div>
          )}
"""

# Try replacing UI
if "Tema Tampilan" in code:
    print("Found UI string, trying regex replace")
    code = re.sub(r"""        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">🎨</div>
            <div className="text-\[10px\] uppercase text-slate-500 font-bold">Tema Tampilan</div>
          </div>
          <div className="flex gap-2 mt-2">
            <button 
              onClick=\{\(\) => \{
                localStorage.setItem\('chuna_theme', 'dark'\);
                document.documentElement.classList.remove\('theme-light'\);
              \}\}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              🌙 Mode Gelap
            </button>
            <button 
              onClick=\{\(\) => \{
                localStorage.setItem\('chuna_theme', 'light'\);
                document.documentElement.classList.add\('theme-light'\);
              \}\}
              className="flex-1 bg-slate-200 border border-slate-300 text-slate-800 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              data-no-invert
            >
              ☀️ Mode Terang
            </button>
          </div>
        </div>""", new_ui, code)

with open('src/components/views/Konfig.tsx', 'w') as f:
    f.write(code)

print("Konfig.tsx updated for BG")
