import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playAccessGranted } from '../../utils/audio';

const SakuraRain = () => {
  const [petals, setPetals] = useState<{ id: number, x: number, delay: number, duration: number, size: number, rotation: number, xMovement: number }[]>([]);
  
  useEffect(() => {
    const newPetals = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // %
      delay: Math.random() * 10, // seconds
      duration: 6 + Math.random() * 8, // seconds
      size: 10 + Math.random() * 10, // px
      rotation: Math.random() * 360,
      xMovement: Math.random() * 20 - 10
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute top-[-10%] bg-gradient-to-br from-pink-200 to-pink-400 rounded-tl-full rounded-br-full rounded-tr-sm rounded-bl-sm opacity-60"
          style={{
            width: petal.size,
            height: petal.size,
            left: `${petal.x}%`,
            boxShadow: '0 0 5px rgba(244, 114, 182, 0.4)'
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [`${petal.x}%`, `${petal.x + petal.xMovement}%`],
            rotate: [petal.rotation, petal.rotation + 720]
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

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
      setError('Ara ara~ Username atau password salah ya!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0514] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Anime Space / Sakura Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#13072e] via-[#1c093f] to-[#0a0514] z-0"></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <SakuraRain />

      <AnimatePresence>
        {!isUnlocking ? (
          <motion.div 
            key="login-form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            className="bg-white/5 border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative z-10 backdrop-blur-xl"
          >
            <div className="text-center mb-8">
              <motion.div 
                className="w-24 h-24 flex items-center justify-center mx-auto mb-4 relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <video src="./logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
              </motion.div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400 tracking-wide">E4 STORE</h1>
              <p className="text-pink-200/70 text-sm mt-2 font-medium italic">"Okaeri, silahkan login."</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 mb-2 ml-1">
                  Username
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/20 border border-purple-500/30 p-4 rounded-2xl text-white outline-none focus:border-pink-500/80 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-white/20"
                    placeholder="Masukkan username..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/80 mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-purple-500/30 p-4 rounded-2xl text-white outline-none focus:border-pink-500/80 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-white/20"
                    placeholder="Masukkan password..."
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-pink-400 text-sm font-medium bg-pink-500/10 border border-pink-500/20 p-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] cursor-pointer tracking-widest uppercase text-sm mt-4"
              >
                Masuk
              </motion.button>
              
              <div className="text-center mt-6">
                <a href="#" className="text-xs text-purple-300/60 hover:text-pink-300 transition-colors">Lupa password?</a>
              </div>
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
              className="absolute top-0 left-0 w-full h-1/2 bg-[#0a0514] border-b border-pink-500/50 flex items-end justify-center pb-2 shadow-[0_10px_40px_rgba(236,72,153,0.2)] z-40"
              initial={{ y: 0 }}
              animate={{ y: '-100%' }}
              transition={{ delay: 1.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-1/3 h-1 bg-pink-500/50 rounded-full mb-1"></div>
            </motion.div>
            
            {/* Bottom Door */}
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-1/2 bg-[#0a0514] border-t border-pink-500/50 flex items-start justify-center pt-2 shadow-[0_-10px_40px_rgba(236,72,153,0.2)] z-40"
              initial={{ y: 0 }}
              animate={{ y: '100%' }}
              transition={{ delay: 1.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
               <div className="w-1/3 h-1 bg-pink-500/50 rounded-full mt-1"></div>
            </motion.div>

            {/* Glowing Core / Decryption Text */}
            <motion.div 
              className="relative z-50 flex flex-col items-center justify-center pointer-events-none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1.5], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.6, 1], ease: "easeInOut" }}
            >
              <div className="w-32 h-32 rounded-full border-4 border-t-pink-400 border-r-pink-400 border-b-transparent border-l-transparent animate-spin mb-8 shadow-[0_0_30px_rgba(236,72,153,0.6)]"></div>
              <motion.h2 
                className="text-pink-400 font-mono text-3xl tracking-[0.4em] font-bold uppercase drop-shadow-[0_0_15px_rgba(236,72,153,1)]"
              >
                Okaerinasai
              </motion.h2>
              <p className="text-pink-400/80 font-mono text-sm mt-3 uppercase tracking-[0.2em] animate-pulse">Authenticating...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
