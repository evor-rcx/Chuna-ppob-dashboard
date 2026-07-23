import os

with open('/app/applet/src/components/views/Login.tsx', 'r') as f:
    content = f.read()

target = """          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            🐾
          </div>"""

replacement = """          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden border border-slate-700 shadow-lg">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>"""

content = content.replace(target, replacement)

with open('/app/applet/src/components/views/Login.tsx', 'w') as f:
    f.write(content)

