import { useState, useEffect } from 'react';
import { Cpu, Thermometer, HardDrive, Server, Activity, Clock, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

export interface ServerHardwareStats {
  hostType: 'armbian_stb' | 'proxmox' | 'home_server' | 'cloud_container' | 'linux_generic';
  hostName: string;
  osName: string;
  kernelVersion: string;
  arch: string;
  isArmbian: boolean;
  isProxmox: boolean;
  isARM64: boolean;
  deviceModel: string;
  boardInfo?: {
    boardName?: string;
    linuxFamily?: string;
    branch?: string;
    version?: string;
  };
  cpu: {
    model: string;
    cores: number;
    usagePercent: number;
    loadAvg: [number, number, number];
    frequencyMHz?: number;
  };
  temperature: {
    celsius: number | null;
    status: 'OPTIMAL' | 'WARM' | 'HOT' | 'CRITICAL';
    sensorName: string;
    zones: Array<{ name: string; type: string; temp: number }>;
    isSimulated: boolean;
    recommendation: string;
  };
  memory: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    availableMB: number;
    usagePercent: number;
    buffersMB: number;
    cachedMB: number;
    swapTotalMB: number;
    swapUsedMB: number;
    swapUsagePercent: number;
  };
  storage: {
    totalGB: number;
    usedGB: number;
    freeGB: number;
    usagePercent: number;
    mountPoint: string;
  };
  network: {
    primaryIp: string;
    interfaces: Array<{ name: string; ip: string }>;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
  procReadingMethod: 'direct_proc_fs' | 'node_os_fallback';
  timestamp: string;
}

interface ServerHardwareWidgetProps {
  compact?: boolean;
  className?: string;
}

export function ServerHardwareWidget({ compact = false, className = '' }: ServerHardwareWidgetProps) {
  const [stats, setStats] = useState<ServerHardwareStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/system/server-stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (e: any) {
      setError('Gagal memuat status server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 4 seconds for live thermal & CPU monitoring
    const timer = setInterval(fetchStats, 4000);
    return () => clearInterval(timer);
  }, []);

  const getTempColor = (status?: string, temp?: number | null) => {
    if (temp === null || temp === undefined) return 'text-slate-400 bg-slate-800/60 border-slate-700';
    if (status === 'CRITICAL' || temp >= 82) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (status === 'HOT' || temp >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (status === 'WARM' || temp >= 55) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const getHostBadge = (hostType?: string, isArmbian?: boolean, isProxmox?: boolean) => {
    if (isArmbian || hostType === 'armbian_stb') {
      return { label: 'ARMBIAN ARM64 (STB)', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
    }
    if (isProxmox || hostType === 'proxmox') {
      return { label: 'PROXMOX VE (HYPERVISOR)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    if (hostType === 'home_server') {
      return { label: 'LINUX HOME SERVER', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    return { label: 'LINUX CLOUD/CONTAINER', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
  };

  // Compact layout (used inside Sidebar)
  if (compact) {
    if (loading && !stats) {
      return (
        <div className={`p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between ${className}`}>
          <span className="flex items-center gap-1.5">
            <RefreshCw size={12} className="animate-spin text-cyan-400" />
            Membaca /proc & thermal...
          </span>
        </div>
      );
    }

    if (error && !stats) {
      return (
        <div className={`p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-[11px] text-rose-300 flex items-center justify-between ${className}`}>
          <span>Sensor Hardware Offline</span>
          <button onClick={fetchStats} className="text-rose-400 underline">Coba Lagi</button>
        </div>
      );
    }

    if (!stats) return null;

    const tempVal = stats.temperature?.celsius;
    const tempStatus = stats.temperature?.status;
    const badge = getHostBadge(stats.hostType, stats.isArmbian, stats.isProxmox);

    return (
      <div className={`space-y-2.5 ${className}`}>
        {/* Header with Host Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Server size={13} className="text-cyan-400" />
            <span className="text-[11px] font-bold text-white tracking-wide">Hardware Server</span>
          </div>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${badge.color}`}>
            {badge.label.split(' ')[0]} {stats.arch}
          </span>
        </div>

        {/* 2-Column Gauge: Temp & CPU */}
        <div className="grid grid-cols-2 gap-2">
          {/* Suhu CPU */}
          <div className={`p-2 rounded-xl border flex flex-col justify-between ${getTempColor(tempStatus, tempVal)}`}>
            <div className="flex items-center justify-between text-[10px] opacity-80">
              <span className="flex items-center gap-1">
                <Thermometer size={12} />
                Suhu CPU
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black tracking-tight">{tempVal !== null ? `${tempVal}°C` : 'N/A'}</span>
              <span className="text-[9px] font-bold uppercase opacity-75">{tempStatus || 'OK'}</span>
            </div>
          </div>

          {/* Beban CPU */}
          <div className="p-2 rounded-xl border border-slate-700/60 bg-slate-900/70 flex flex-col justify-between text-slate-300">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu size={12} className="text-cyan-400" />
                Beban CPU
              </span>
              <span className="text-[9px] font-mono">{stats.cpu.cores} Cores</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black text-white">{stats.cpu.usagePercent}%</span>
              <span className="text-[9px] font-mono text-slate-400">L:{stats.cpu.loadAvg[0]}</span>
            </div>
          </div>
        </div>

        {/* RAM Usage Bar */}
        <div className="space-y-1 bg-slate-900/40 p-2 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity size={11} className="text-indigo-400" />
              RAM: {stats.memory.usedMB} / {stats.memory.totalMB} MB
            </span>
            <span className="font-mono font-bold text-slate-300">{stats.memory.usagePercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                stats.memory.usagePercent > 85 ? 'bg-rose-500' : stats.memory.usagePercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${stats.memory.usagePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Footer info: Uptime & Detail Trigger */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1 font-mono truncate max-w-[150px]" title={`Uptime: ${stats.uptime.formatted}`}>
            <Clock size={11} className="text-slate-500" />
            {stats.uptime.formatted}
          </span>
          <button
            onClick={() => setShowDetailModal(true)}
            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline text-[10px]"
          >
            Detail HW &gt;
          </button>
        </div>

        {/* Detailed Modal if clicked from sidebar */}
        {showDetailModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                    <Server size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Spesifikasi & Telemetri Server Host</h3>
                    <p className="text-[11px] text-slate-400">Pembacaan langsung via /proc & /sys (Zero CPU Overhead)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  ✕ Tutup
                </button>
              </div>

              {/* Hardware Spec Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Perangkat / Mesin</div>
                  <div className="font-bold text-white text-sm">{stats.deviceModel}</div>
                  <div className="text-[11px] text-slate-400 font-mono">Arch: {stats.arch} | Host: {stats.hostName}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Sistem Operasi</div>
                  <div className="font-bold text-cyan-300 text-sm truncate" title={stats.osName}>{stats.osName}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate" title={stats.kernelVersion}>Kernel: {stats.kernelVersion}</div>
                </div>
              </div>

              {/* Temperature & Thermal Zone Details */}
              <div className={`p-4 rounded-xl border space-y-2 ${getTempColor(stats.temperature.status, stats.temperature.celsius)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Thermometer size={16} />
                    Status Thermal CPU: {stats.temperature.celsius}°C ({stats.temperature.status})
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
                    Sensor: {stats.temperature.sensorName}
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  💡 {stats.temperature.recommendation}
                </p>
                {stats.temperature.zones && stats.temperature.zones.length > 1 && (
                  <div className="pt-2 border-t border-current/20 flex flex-wrap gap-2 text-[11px] font-mono">
                    {stats.temperature.zones.map((z, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-black/30">
                        {z.name} ({z.type}): {z.temp}°C
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Memory & Storage */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Memori RAM & Swap</span>
                    <span className="font-mono text-indigo-300 font-bold">{stats.memory.usagePercent}%</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {stats.memory.usedMB} MB <span className="text-xs text-slate-400 font-normal">/ {stats.memory.totalMB} MB</span>
                  </div>
                  {stats.memory.swapTotalMB > 0 && (
                    <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                      Swap: {stats.memory.swapUsedMB} / {stats.memory.swapTotalMB} MB ({stats.memory.swapUsagePercent}%)
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Penyimpanan / (Root)</span>
                    <span className="font-mono text-emerald-400 font-bold">{stats.storage.usagePercent}%</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {stats.storage.usedGB} GB <span className="text-xs text-slate-400 font-normal">/ {stats.storage.totalGB} GB</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                    Sisa Tersedia: {stats.storage.freeGB} GB
                  </div>
                </div>
              </div>

              {/* IP & Reading method */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>IP Host: <strong className="text-white">{stats.network.primaryIp}</strong></span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck size={13} />
                  Bacaan: {stats.procReadingMethod === 'direct_proc_fs' ? '/proc fs (Direct)' : 'Node Native OS'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full card layout (for Ringkasan / Dashboard / Security views)
  if (loading && !stats) {
    return (
      <div className={`p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 animate-pulse ${className}`}>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <RefreshCw size={16} className="animate-spin text-cyan-400" />
          Memuat telemetri hardware server Armbian / Proxmox...
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={`p-5 rounded-2xl bg-rose-950/30 border border-rose-900/50 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2 text-rose-300 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
        <button onClick={fetchStats} className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer">
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const badge = getHostBadge(stats.hostType, stats.isArmbian, stats.isProxmox);
  const tempVal = stats.temperature.celsius;
  const tempStatus = stats.temperature.status;

  return (
    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
            <Server size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live Hardware Telemetry: {stats.deviceModel}</h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Optimasi khusus Armbian ARM64 & Proxmox — pembacaan langsung dari <code className="text-cyan-300">/proc</code> dan thermal zone tanpa beban proses.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
            IP: {stats.network.primaryIp}
          </span>
          <button
            onClick={fetchStats}
            title="Refresh manual"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 4 Main Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Suhu CPU & Thermal Zone */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${getTempColor(tempStatus, tempVal)}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer size={16} />
              Suhu CPU (Thermal)
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/30">
              {tempStatus}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{tempVal !== null ? `${tempVal}°C` : 'N/A'}</div>
            <div className="text-[11px] opacity-85 truncate mt-0.5" title={stats.temperature.sensorName}>
              Zone: {stats.temperature.sensorName}
            </div>
          </div>
          <div className="text-[10px] opacity-75 border-t border-current/20 pt-1.5 leading-tight">
            {stats.temperature.recommendation}
          </div>
        </div>

        {/* Card 2: CPU Load & Usage */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu size={16} className="text-cyan-400" />
              Beban CPU (/proc/stat)
            </span>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
              {stats.cpu.cores} Cores
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.cpu.usagePercent}%</div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-cyan-400 transition-all duration-500"
                style={{ width: `${stats.cpu.usagePercent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1.5 flex justify-between">
            <span>Load Avg:</span>
            <span className="text-slate-200">{stats.cpu.loadAvg.join(' • ')}</span>
          </div>
        </div>

        {/* Card 3: RAM Memory & Swap */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity size={16} className="text-indigo-400" />
              RAM (/proc/meminfo)
            </span>
            <span className="text-[10px] font-mono font-bold text-indigo-300">
              {stats.memory.usagePercent}%
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {stats.memory.usedMB} <span className="text-sm font-normal text-slate-400">/ {stats.memory.totalMB} MB</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full transition-all duration-500 ${stats.memory.usagePercent > 80 ? 'bg-amber-400' : 'bg-indigo-400'}`}
                style={{ width: `${stats.memory.usagePercent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1.5 flex justify-between">
            <span>Swap:</span>
            <span className="text-slate-200">
              {stats.memory.swapTotalMB > 0 ? `${stats.memory.swapUsedMB} / ${stats.memory.swapTotalMB} MB` : 'Off'}
            </span>
          </div>
        </div>

        {/* Card 4: Storage & Uptime */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HardDrive size={16} className="text-emerald-400" />
              Root Disk (/)
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {stats.storage.usagePercent}%
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {stats.storage.usedGB} <span className="text-sm font-normal text-slate-400">/ {stats.storage.totalGB} GB</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${stats.storage.usagePercent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1.5 flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Clock size={11} /> Uptime:
            </span>
            <span className="text-slate-200 truncate max-w-[120px]" title={stats.uptime.formatted}>
              {stats.uptime.formatted}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Host OS & Method Footer Banner */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-medium truncate">{stats.osName}</span>
          <span className="text-slate-500 font-mono">({stats.kernelVersion})</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
          <span className="text-cyan-400">CPU: {stats.cpu.model}</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck size={13} />
            Metode: {stats.procReadingMethod === 'direct_proc_fs' ? 'Zero-Overhead /proc' : 'Node Native'}
          </span>
        </div>
      </div>
    </div>
  );
}
