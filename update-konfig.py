import re

with open('src/components/views/Konfig.tsx', 'r') as f:
    code = f.read()

# We'll add the theme toggle right after the balance display
pattern = r"""        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username Digiflazz</label>"""

new_code = """        </div>
        
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">🎨</div>
            <div className="text-[10px] uppercase text-slate-500 font-bold">Tema Tampilan</div>
          </div>
          <div className="flex gap-2 mt-2">
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

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username Digiflazz</label>"""

if pattern in code:
    code = code.replace(pattern, new_code)
    with open('src/components/views/Konfig.tsx', 'w') as f:
        f.write(code)
    print("Replaced!")
else:
    print("Not found!")
