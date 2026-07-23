import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getHolidayInfo } from '../utils/holidays';
import { Store } from "lucide-react";
import { playPowerDown, playTerminalBlip } from '../utils/audio';


const Clock = () => {
  const [time, setTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  const dateString = `${hari[time.getDay()]}, ${time.getDate()} ${bulan[time.getMonth()]} ${time.getFullYear()}`;
  const holidayInfo = getHolidayInfo(time);

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden">
      <div className="text-4xl font-light text-white tracking-tighter">{hours}:{minutes}</div>
      <div className="text-xs uppercase tracking-widest text-slate-400 mt-1">{dateString}</div>
      {holidayInfo && (
        <div className={`mt-3 pt-3 border-t border-slate-700/50 text-xs font-medium tracking-wide flex items-center gap-2 ${holidayInfo.isToday ? 'text-amber-400' : 'text-slate-500'}`}>
          <span className="relative flex h-2 w-2">
            {holidayInfo.isToday && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${holidayInfo.isToday ? 'bg-amber-500' : 'bg-slate-600'}`}></span>
          </span>
          {holidayInfo.text}
        </div>
      )}
    </div>
  );
};

export function Sidebar() {
  const [digiflazzBalance, setDigiflazzBalance] = useState(0);
  const [digiflazzStatus, setDigiflazzStatus] = useState('Disconnected');
  const [digiflazzUsername, setDigiflazzUsername] = useState('');
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutLogs, setLogoutLogs] = useState<string[]>([]);

  useEffect(() => {
    // Fetch Digiflazz status on mount and every 30 seconds
    const fetchStatus = () => {
      fetch('/api/digiflazz/status')
        .then(res => res.json())
        .then(data => {
          setDigiflazzBalance(data.balance || 0);
          setDigiflazzStatus(data.status || 'Disconnected');
          if (data.username) setDigiflazzUsername(data.username);
        })
        .catch(() => setDigiflazzStatus('Disconnected'));
    };
    
    fetchStatus();
    const statusTimer = setInterval(fetchStatus, 30000);
    
    return () => {
      clearInterval(statusTimer);
    };
  }, []);

  const isConnected = digiflazzStatus?.includes('Connected');

  const handleLogout = () => {
    setIsLoggingOut(true);
    playPowerDown();
    
    const logs = [
      "INITIATING LOGOUT SEQUENCE...",
      "DISCONNECTING FROM MAINFRAME...",
      "CLEARING LOCAL CACHE...",
      "CLOSING SECURE SOCKETS...",
      "TERMINATING PPOB CONNECTION...",
      "PURGING SESSION DATA...",
      "ENCRYPTING LOCAL STORE...",
      "ACCESS REVOKED.",
      "GOODBYE, OWNER EKO PRASETYO NUGROHO."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setLogoutLogs(prev => [...prev, logs[currentLogIndex]]);
        playTerminalBlip();
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          sessionStorage.removeItem('chuna_auth');
          window.dispatchEvent(new Event('logout'));
        }, 1500);
      }
    }, 400);
  };

  return (
    <>
      <aside className="w-full md:w-72 border-r border-slate-800 bg-[#0f172a]/50 p-6 flex flex-col gap-6 md:min-h-screen">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-16 h-16 flex items-center justify-center relative">
            <video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 drop-shadow-md">STORE</h1>
        </div>
        <Clock />
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Sistem PPOB</span>
            <span className={`flex h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full w-[100%] ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex justify-between items-center mt-2"><p className="text-[10px] text-slate-500">Koneksi Pusat: {isConnected ? 'Stable' : 'Disconnected'}</p></div>
        </div>
        <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-2xl p-5 shadow-lg shadow-sky-900/20">
          <div className="text-xs text-sky-100 opacity-80 uppercase tracking-widest">Dasbord Pengaturan Owner</div>
          <motion.div 
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
            className="mt-6 w-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isLoggingOut && (
          <motion.div 
            className="fixed inset-0 z-50 bg-[#050914] flex flex-col p-8 font-mono text-cyan-500 shadow-[inset_0_0_100px_rgba(6,182,212,0.1)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Terminal Header */}
            <div className="flex justify-between items-center border-b border-cyan-900/50 pb-4 mb-6">
              <div className="text-xs tracking-[0.3em] uppercase">E4 STORE - System Terminal</div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-900 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-cyan-900"></div>
                <div className="w-3 h-3 rounded-full bg-cyan-900"></div>
              </div>
            </div>
            
            {/* Terminal Logs */}
            <div className="flex-1 overflow-hidden flex flex-col justify-end">
              {logoutLogs.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mb-2 text-sm md:text-lg flex gap-3"
                >
                  <span className="text-cyan-700">[{new Date().toISOString().split('T')[1].substring(0,8)}]</span>
                  <span className={log?.includes('REVOKED') || log?.includes('GOODBYE') ? 'text-cyan-300 font-bold' : ''}>
                    {log}
                  </span>
                </motion.div>
              ))}
              {/* Blinking Cursor */}
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-3 h-5 bg-cyan-500 mt-2"
              ></motion.div>
            </div>
            
            {/* Grid Overlay for CRT effect */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
