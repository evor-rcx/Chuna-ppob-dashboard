import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playAccessGranted } from '../../utils/audio';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'chuna' && password === 'Chuna_loli1904') {
      setIsUnlocking(true);
      playAccessGranted();
      setTimeout(() => {
        onLogin();
      }, 1000);
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-4 overflow-hidden relative">
      <AnimatePresence>
        {!isUnlocking ? (
          <motion.div 
            key="login-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 w-full max-w-md shadow-2xl relative z-10 backdrop-blur-sm"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 relative">
                <video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-white">E4 STORE</h1>
              <p className="text-slate-400 text-sm mt-2">Silakan login untuk melanjutkan</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Masukkan username"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Masukkan password"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                Login
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="unlock-animation"
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Top Door */}
            <motion.div 
              className="absolute top-0 left-0 w-full h-1/2 bg-slate-950 border-b-2 border-cyan-500/50 flex items-end justify-center pb-2 shadow-[0_10px_40px_rgba(6,182,212,0.3)] z-40"
              initial={{ y: 0 }}
              animate={{ y: '-100%' }}
              transition={{ delay: 1.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-1/3 h-1 bg-cyan-500/50 rounded-full mb-1"></div>
            </motion.div>
            
            {/* Bottom Door */}
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-1/2 bg-slate-950 border-t-2 border-cyan-500/50 flex items-start justify-center pt-2 shadow-[0_-10px_40px_rgba(6,182,212,0.3)] z-40"
              initial={{ y: 0 }}
              animate={{ y: '100%' }}
              transition={{ delay: 1.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
               <div className="w-1/3 h-1 bg-cyan-500/50 rounded-full mt-1"></div>
            </motion.div>

            {/* Glowing Core / Decryption Text */}
            <motion.div 
              className="relative z-50 flex flex-col items-center justify-center pointer-events-none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1.5], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.6, 1], ease: "easeInOut" }}
            >
              <div className="w-32 h-32 rounded-full border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin mb-8 shadow-[0_0_30px_rgba(34,211,238,0.6)]"></div>
              <motion.h2 
                className="text-cyan-400 font-mono text-3xl tracking-[0.4em] font-bold uppercase drop-shadow-[0_0_15px_rgba(34,211,238,1)]"
              >
                Access Granted
              </motion.h2>
              <p className="text-cyan-400/80 font-mono text-sm mt-3 uppercase tracking-[0.2em] animate-pulse">Decrypting Mainframe...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
