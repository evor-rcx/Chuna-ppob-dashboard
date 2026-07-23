import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { getHolidayInfo } from '../utils/holidays';

export function Sidebar() {
  const [time, setTime] = useState<Date>(new Date());
  const [digiflazzBalance, setDigiflazzBalance] = useState(0);
  const [digiflazzStatus, setDigiflazzStatus] = useState('Disconnected');
  const [digiflazzUsername, setDigiflazzUsername] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
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
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  
  const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  const dateString = `${hari[time.getDay()]}, ${time.getDate()} ${bulan[time.getMonth()]} ${time.getFullYear()}`;
  const holidayInfo = getHolidayInfo(time);

  const isConnected = digiflazzStatus.includes('Connected');

  return (
    <aside className="w-full md:w-72 border-r border-slate-800 bg-[#0f172a]/50 p-6 flex flex-col gap-6 md:min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center border border-slate-700 shadow-lg relative">
          <video 
            src="/logo.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover scale-[1.2]"
          />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 drop-shadow-md">STORE</h1>
      </div>

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

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Sistem PPOB</span>
          <span className={`flex h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </div>
        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full w-[100%] ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
        <p className="text-[10px] mt-2 text-slate-500">Koneksi Pusat: {isConnected ? 'Stable' : 'Disconnected'}</p>
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
      </div>
    </aside>
  );
}
