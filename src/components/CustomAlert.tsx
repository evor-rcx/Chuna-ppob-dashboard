import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function CustomAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Override window.alert
    const originalAlert = window.alert;
    window.alert = (msg: any) => {
      setMessage(String(msg));
      setIsOpen(true);
    };
    
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const lowerMsg = message.toLowerCase();
  let type = 'info';
  if (lowerMsg.includes('berhasil') || lowerMsg.includes('sukses')) {
    type = 'success';
  } else if (lowerMsg.includes('gagal') || lowerMsg.includes('kesalahan') || lowerMsg.includes('error')) {
    type = 'error';
  } else {
    // If it's a generic message but no specific keywords, let's just make it success-like or info
    type = 'success'; // default to success visual as requested by user
  }

  const icon = type === 'error' ? '⚠️' : '🎉';
  const title = type === 'error' ? 'Oops, Gagal!' : 'Berhasil!';
  const btnText = type === 'error' ? 'Tutup' : 'Oke, mantap!';
  const btnGradient = type === 'error' ? 'from-red-500 to-rose-600' : 'from-[#4B70F5] to-[#7C3AED]';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[320px] bg-[#131b2f]/80 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 flex flex-col items-center text-center shadow-2xl"
          >
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-300 text-[15px] leading-relaxed mb-6">
              {message}
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r ${btnGradient} text-white font-semibold shadow-lg hover:opacity-90 transition-all active:scale-95`}
            >
              {btnText}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
