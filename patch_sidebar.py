import re

with open('/app/applet/src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace("const isConnected = digiflazzStatus.includes('Connected');", """const isConnected = digiflazzStatus.includes('Connected');

  const handleLogout = () => {
    sessionStorage.removeItem('chuna_auth');
    window.location.reload();
  };""")

logout_btn = """        <motion.div 
          animate={{ 
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-400 mt-1 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] tracking-tighter"
          style={{ backgroundSize: "200% auto" }}
        >
          E4 STORE
        </motion.div>
        
        <button 
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          Logout
        </button>"""

content = content.replace("""        <motion.div 
          animate={{ 
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-400 mt-1 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] tracking-tighter"
          style={{ backgroundSize: "200% auto" }}
        >
          E4 STORE
        </motion.div>""", logout_btn)

with open('/app/applet/src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
