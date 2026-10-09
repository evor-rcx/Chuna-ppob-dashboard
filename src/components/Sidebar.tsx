import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getHolidayInfo } from '../utils/holidays';
import { Store } from "lucide-react";
import { playPowerDown, playTerminalBlip } from '../utils/audio';
import { ServerHardwareWidget } from './ServerHardwareWidget';


const Clock = () => {
  const [time, setTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Makassar',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  const timeStr = new Intl.DateTimeFormat('id-ID', timeOptions).format(time).replace(/\./g, ':');

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Makassar',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const dateString = new Intl.DateTimeFormat('id-ID', dateOptions).format(time);
  const holidayInfo = getHolidayInfo(time);

  return (
    <div className="bg-white/95 border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">{timeStr}</span>
        <span className="text-xs font-bold text-slate-500 font-sans">WITA</span>
      </div>
      <div className="text-xs text-slate-500 font-medium mt-1">{dateString}</div>
      {holidayInfo && (
        <div className={`mt-3 pt-2.5 border-t border-slate-100 text-xs font-semibold flex items-center gap-1.5 ${holidayInfo.isToday ? 'text-blue-600' : 'text-slate-500'}`}>
          <span>🇮🇩</span>
          <span>{holidayInfo.text}</span>
          {holidayInfo.isToday && (
            <span className="relative flex h-2 w-2 ml-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export function Sidebar() {
  const [digiflazzBalance, setDigiflazzBalance] = useState(0);
  const [digiflazzStatus, setDigiflazzStatus] = useState('Disconnected');
  const [digiflazzUsername, setDigiflazzUsername] = useState('');
  const [statusView, setStatusView] = useState<'hardware' | 'ppob'>('hardware');
  
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
      "GOODBYE, OWNER E4 STORE."
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
      <aside className="w-full md:w-80 border border-slate-200/80 bg-white/90 p-5 sm:p-6 flex flex-col gap-5 md:min-h-screen rounded-3xl shadow-xl backdrop-blur-xl mb-4 md:mb-0 md:mr-6 text-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-full p-0.5 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative">
              <video 
                src="/logo.mp4" 
                poster="/logo.webp"
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const img = document.createElement('img');
                    img.src = '/logo.webp';
                    img.className = 'w-full h-full object-cover pointer-events-none';
                    img.onerror = () => { img.src = '/logo.gif'; };
                    parent.replaceChild(img, e.currentTarget);
                  }
                }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Halo, Owner 👋</p>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">E4 STORE</h1>
          </div>
        </div>

        <Clock />

        <div className="bg-white/95 border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs">
          {/* Sub-header with Tab Selector: Armbian/HW vs PPOB */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-full">
              <button
                type="button"
                onClick={() => setStatusView('hardware')}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                  statusView === 'hardware'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                STB / HW
              </button>
              <button
                type="button"
                onClick={() => setStatusView('ppob')}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                  statusView === 'ppob'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                PPOB
              </button>
            </div>
            <span className="flex h-2 w-2 relative" title="Telemetri Realtime Aktif">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {statusView === 'hardware' ? (
            <ServerHardwareWidget variant="modern_glass" />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Digiflazz</span>
                <span className={`text-xs font-bold ${isConnected ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${isConnected ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-1/4'}`}></div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SHIELD: EGIS • NYX • ANCHOR
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200/60">
                  ACTIVE
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/95 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center">
          <span className="text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono">
            E4 STORE
          </span>
          <button 
            onClick={handleLogout}
            className="mt-2.5 w-full px-4 py-1.5 text-xs font-bold tracking-wider text-rose-500 border border-rose-300 hover:bg-rose-50 rounded-xl transition-all cursor-pointer text-center active:scale-95"
          >
            [ LOGOUT ]
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
