import { useState, useEffect } from 'react';
import { Cpu, Thermometer, HardDrive, Server, Activity, Clock, ShieldCheck, RefreshCw, AlertTriangle, Usb, ArrowDown, ArrowUp, Wifi, Globe, Network, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

export interface StorageDevice {
  name: string;
  device: string;
  mountPoint: string;
  fsType: string;
  totalGB: number;
  usedGB: number;
  freeGB: number;
  usagePercent: number;
  isUsb: boolean;
  isRoot: boolean;
  status: 'MOUNTED' | 'UNMOUNTED';
}

export interface NetworkInterfaceDetail {
  name: string;
  ip: string;
  isUp: boolean;
  isWireless: boolean;
  rxBytes: number;
  txBytes: number;
  downloadSpeedKBps: number;
  uploadSpeedKBps: number;
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  formattedDownload: string;
  formattedUpload: string;
  totalRxFormatted: string;
  totalTxFormatted: string;
}

export interface NetworkStats {
  primaryIp: string;
  totalDownloadSpeedKBps?: number;
  totalUploadSpeedKBps?: number;
  totalDownloadSpeedMbps?: number;
  totalUploadSpeedMbps?: number;
  formattedDownloadSpeed?: string;
  formattedUploadSpeed?: string;
  totalDownloadedFormatted?: string;
  totalUploadedFormatted?: string;
  activeInterface?: string;
  interfaces: NetworkInterfaceDetail[];
}

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
    drives?: StorageDevice[];
    usbDrives?: StorageDevice[];
    hasUsbAttached?: boolean;
    usbCount?: number;
  };
  network: NetworkStats;
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

  const [cleaning, setCleaning] = useState(false);
  const [cleanerResult, setCleanerResult] = useState<any | null>(null);
  const [cleanerStatus, setCleanerStatus] = useState<any | null>(null);

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

  const fetchCleanerStatus = async () => {
    try {
      const res = await fetch('/api/system/cleaner-status');
      if (res.ok) {
        const data = await res.json();
        if (data.status) setCleanerStatus(data.status);
      }
    } catch (e) {}
  };

  const handleRunCleanup = async () => {
    if (cleaning) return;
    setCleaning(true);
    setCleanerResult(null);
    try {
      const res = await fetch('/api/system/cleanup', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.result) {
        setCleanerResult(data.result);
        await fetchStats();
        await fetchCleanerStatus();
      }
    } catch (e) {
      console.error('Cleanup error:', e);
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCleanerStatus();
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

        {/* USB Flashdisk / Storage Status Bar in Sidebar */}
        <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Usb size={11} className={stats.storage.hasUsbAttached ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
            USB Storage:
          </span>
          {stats.storage.hasUsbAttached ? (
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {stats.storage.usbCount} Terpasang ({stats.storage.usbDrives?.[0]?.totalGB} GB)
            </span>
          ) : (
            <span className="font-mono text-slate-500 text-[9px]">Kosong / Tidak Ada</span>
          )}
        </div>

        {/* Network Bandwidth Speed in Sidebar */}
        <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Network size={11} className="text-sky-400" />
            Speed ({stats.network.activeInterface || 'eth0'}):
          </span>
          <div className="flex items-center gap-2 font-mono text-[9px]">
            <span className="flex items-center text-emerald-400 font-bold" title="Kecepatan Download">
              <ArrowDown size={10} className="mr-0.5 text-emerald-400" />
              {stats.network.formattedDownloadSpeed || '0 KB/s'}
            </span>
            <span className="flex items-center text-sky-400 font-bold" title="Kecepatan Upload">
              <ArrowUp size={10} className="mr-0.5 text-sky-400" />
              {stats.network.formattedUploadSpeed || '0 KB/s'}
            </span>
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

              {/* Memory & Storage Root */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Penyimpanan Internal (Root /)</span>
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

              {/* USB Flashdisk & External Storage Section in Modal */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Usb size={15} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Media USB & Flashdisk Terdeteksi
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    stats.storage.hasUsbAttached ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {stats.storage.hasUsbAttached ? `${stats.storage.usbCount} USB Aktif` : 'Tidak Ada USB Terpasang'}
                  </span>
                </div>

                {stats.storage.usbDrives && stats.storage.usbDrives.length > 0 ? (
                  <div className="space-y-2">
                    {stats.storage.usbDrives.map((usb, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                            <Usb size={13} />
                            {usb.name}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            usb.status === 'MOUNTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {usb.status === 'MOUNTED' ? 'MOUNTED' : 'UNMOUNTED'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>Device: <strong className="text-slate-200">{usb.device}</strong></span>
                          <span>Format: <strong className="text-slate-200">{usb.fsType}</strong></span>
                          <span>Kapasitas: <strong className="text-white">{usb.totalGB} GB</strong></span>
                        </div>
                        {usb.status === 'MOUNTED' ? (
                          <>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Mount Point: <span className="text-cyan-300">{usb.mountPoint}</span> ({usb.usedGB} GB dipakai, {usb.freeGB} GB bebas)
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${usb.usagePercent}%` }}></div>
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-900/50">
                            💡 {usb.mountPoint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-900/50 border border-dashed border-slate-800 text-slate-400 text-xs flex flex-col gap-1">
                    <p className="font-medium text-slate-300">Belum ada Flashdisk / USB Drive terdeteksi di port STB.</p>
                    <p className="text-[11px] text-slate-500">
                      Format flashdisk didukung: <strong>FAT32, NTFS, exFAT, EXT4</strong>. Saat dicolokkan ke port USB STB Armbian, partisi akan otomatis terdeteksi atau dapat di-mount ke <code>/media/usb</code> atau <code>/mnt/</code>.
                    </p>
                  </div>
                )}
              </div>

              {/* Network Speed & Bandwidth Section in Modal */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Network size={14} className="text-sky-400" />
                    Kecepatan & Bandwidth Jaringan (/proc/net/dev)
                  </span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-emerald-400 font-bold flex items-center" title="Kecepatan Download">
                      <ArrowDown size={12} className="mr-0.5 text-emerald-400" />
                      {stats.network.formattedDownloadSpeed || '0 KB/s'}
                    </span>
                    <span className="text-sky-400 font-bold flex items-center" title="Kecepatan Upload">
                      <ArrowUp size={12} className="mr-0.5 text-sky-400" />
                      {stats.network.formattedUploadSpeed || '0 KB/s'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400">Total Diterima (DL): </span>
                    <strong className="text-emerald-300">{stats.network.totalDownloadedFormatted || '0 B'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Terkirim (UL): </span>
                    <strong className="text-sky-300">{stats.network.totalUploadedFormatted || '0 B'}</strong>
                  </div>
                </div>

                {stats.network.interfaces && stats.network.interfaces.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {stats.network.interfaces.map((iface, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] font-mono px-2.5 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800">
                        <div className="flex items-center gap-1.5">
                          {iface.isWireless ? <Wifi size={12} className="text-amber-400" /> : <Network size={12} className="text-cyan-400" />}
                          <span className="font-bold text-white">{iface.name}</span>
                          <span className="text-slate-400">({iface.ip})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 flex items-center">
                            <ArrowDown size={10} className="mr-0.5" />
                            {iface.formattedDownload}
                          </span>
                          <span className="text-sky-400 flex items-center">
                            <ArrowUp size={10} className="mr-0.5" />
                            {iface.formattedUpload}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STB Armbian Safe Cleaner Section in Modal */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} className="text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Pembersih Sampah Otomatis (STB Armbian Safe)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Membersihkan sisa audio VN, /tmp, file log, dan merapikan inode Baileys
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRunCleanup}
                    disabled={cleaning}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                  >
                    {cleaning ? (
                      <>
                        <RefreshCw size={12} className="animate-spin text-amber-300" />
                        Membersihkan...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} className="text-amber-400" />
                        Bersihkan Sekarang
                      </>
                    )}
                  </button>
                </div>

                {cleanerResult && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <CheckCircle2 size={13} />
                      Pembersihan Sampah Berhasil!
                    </div>
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      • {cleanerResult.cleanedFilesCount} file sampah dibersihkan ({cleanerResult.freedFormatted})
                      <br />
                      • RAM Dibebaskan: +{cleanerResult.ramFreedMB} MB (Tersedia: {cleanerResult.memoryAfter.freeMB} MB)
                      <br />
                      • Ruang Disk Bebas: {cleanerResult.storage.freeGB} GB / {cleanerResult.storage.totalGB} GB
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>Jadwal Berkala: <strong className="text-emerald-400">Aktif (Tiap 30 Menit)</strong></span>
                  <span className="text-slate-500">db.json & sesi login WA dilindungi 100%</span>
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

      {/* 5 Main Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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

        {/* Card 4: Kecepatan Jaringan (/proc/net/dev) */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Network size={16} className="text-sky-400" />
              Jaringan ({stats.network.activeInterface || 'eth0'})
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
              Realtime
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ArrowDown size={12} className="text-emerald-400 shrink-0" /> Down:
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {stats.network.formattedDownloadSpeed || '0 KB/s'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ArrowUp size={12} className="text-sky-400 shrink-0" /> Up:
              </span>
              <span className="text-base font-black text-sky-400 font-mono">
                {stats.network.formattedUploadSpeed || '0 KB/s'}
              </span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1.5 flex justify-between items-center">
            <span>Total:</span>
            <span className="text-slate-300 truncate font-mono">
              ↓{stats.network.totalDownloadedFormatted || '0 B'} • ↑{stats.network.totalUploadedFormatted || '0 B'}
            </span>
          </div>
        </div>

        {/* Card 5: Storage & Uptime */}
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

      {/* Realtime Network Traffic & Bandwidth Matrix */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-sky-400" />
            <h4 className="text-sm font-bold text-white tracking-wide">
              Kecepatan & Lalu Lintas Jaringan Realtime (/proc/net/dev)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              IP: {stats.network.primaryIp}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300">
              Aktif: {stats.network.activeInterface || 'eth0'}
            </span>
          </div>
        </div>

        {/* Speed Meters Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-900/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <ArrowDown size={12} className="text-emerald-400" /> Download Speed
              </div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {stats.network.formattedDownloadSpeed || '0 KB/s'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-emerald-300 font-bold">
                {stats.network.totalDownloadSpeedMbps || 0} Mbps
              </div>
              <div className="text-[9px] text-slate-500 font-mono">Bandwidth Rate</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-900/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <ArrowUp size={12} className="text-sky-400" /> Upload Speed
              </div>
              <div className="text-lg font-black text-sky-400 font-mono mt-0.5">
                {stats.network.formattedUploadSpeed || '0 KB/s'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-sky-300 font-bold">
                {stats.network.totalUploadSpeedMbps || 0} Mbps
              </div>
              <div className="text-[9px] text-slate-500 font-mono">Bandwidth Rate</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">
                Total Download (RX)
              </div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {stats.network.totalDownloadedFormatted || '0 B'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Sejak Boot</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">
                Total Upload (TX)
              </div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {stats.network.totalUploadedFormatted || '0 B'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Sejak Boot</span>
            </div>
          </div>
        </div>

        {/* Interface List Cards */}
        {stats.network.interfaces && stats.network.interfaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {stats.network.interfaces.map((iface, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
                      {iface.isWireless ? <Wifi size={13} /> : <Network size={13} />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{iface.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{iface.ip}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    iface.isUp ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {iface.isUp ? (iface.isWireless ? 'WI-FI UP' : 'LAN UP') : 'DOWN'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Download</span>
                    <span className="text-emerald-400 font-bold flex items-center">
                      <ArrowDown size={10} className="mr-0.5 shrink-0" />
                      {iface.formattedDownload}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{iface.downloadSpeedMbps} Mbps</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Upload</span>
                    <span className="text-sky-400 font-bold flex items-center">
                      <ArrowUp size={10} className="mr-0.5 shrink-0" />
                      {iface.formattedUpload}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{iface.uploadSpeedMbps} Mbps</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                  <span>Total Diterima: {iface.totalRxFormatted}</span>
                  <span>Terkirim: {iface.totalTxFormatted}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STB Armbian Safe System Cleaner Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Pembersih Sisa Sampah & Optimasi RAM
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Armbian STB Safe
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Menghapus file sisa VN, audio sementara, cache sistem /tmp, dan merapikan inode Baileys secara otomatis tanpa merusak <strong className="text-slate-300">db.json</strong> atau sesi login WhatsApp.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunCleanup}
            disabled={cleaning}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all shrink-0"
          >
            {cleaning ? (
              <>
                <RefreshCw size={14} className="animate-spin text-slate-950" />
                Membersihkan...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Bersihkan Sampah & RAM
              </>
            )}
          </button>
        </div>

        {cleanerResult && (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle2 size={16} />
              Pembersihan Sistem Berhasil Dijalankan!
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-slate-300">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                🗑️ Sampah Dihapus: <strong className="text-white">{cleanerResult.cleanedFilesCount} File</strong> ({cleanerResult.freedFormatted})
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                💾 RAM Dibebaskan: <strong className="text-emerald-400">+{cleanerResult.ramFreedMB} MB</strong> (Tersedia: {cleanerResult.memoryAfter.freeMB} MB)
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                💽 Ruang Disk Bebas: <strong className="text-cyan-400">{cleanerResult.storage.freeGB} GB</strong> / {cleanerResult.storage.totalGB} GB
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Jadwal Berkala: <strong className="text-slate-200">Aktif Otomatis Setiap 30 Menit</strong>
          </span>
          <span className="font-mono text-slate-500">
            Jaminan Integritas: Database & Akun WhatsApp 100% Terlindungi
          </span>
        </div>
      </div>

      {/* Storage & USB Flashdisk Storage Matrix */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Usb size={16} className={stats.storage.hasUsbAttached ? "text-emerald-400" : "text-slate-400"} />
            <h4 className="text-sm font-bold text-white tracking-wide">
              Media Penyimpanan & Flashdisk USB ({stats.storage.drives?.length || 1} Partisi)
            </h4>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold w-fit ${
            stats.storage.hasUsbAttached ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            {stats.storage.hasUsbAttached ? `USB Terpasang: ${stats.storage.usbCount} Drive` : 'Port USB: Belum Ada Flashdisk'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.storage.drives && stats.storage.drives.length > 0 ? (
            stats.storage.drives.map((d, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                  d.isUsb ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      {d.isUsb ? <Usb size={13} className="text-emerald-400 shrink-0" /> : <HardDrive size={13} className="text-cyan-400 shrink-0" />}
                      <span className="truncate">{d.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {d.device} • {d.fsType}
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    d.status === 'MOUNTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {d.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="font-bold text-white font-mono">{d.totalGB} GB Total</span>
                    {d.status === 'MOUNTED' ? (
                      <span className="text-[10px] font-mono text-slate-400">{d.freeGB} GB Bebas ({d.usagePercent}%)</span>
                    ) : (
                      <span className="text-[10px] text-amber-300">Belum di-Mount</span>
                    )}
                  </div>
                  {d.status === 'MOUNTED' && (
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${d.isUsb ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                        style={{ width: `${d.usagePercent}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 font-mono truncate pt-1 border-t border-slate-800/80">
                  {d.status === 'MOUNTED' ? `Mount: ${d.mountPoint}` : d.mountPoint}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 col-span-full">
              Partisi root terdeteksi: {stats.storage.totalGB} GB ({stats.storage.usedGB} GB terpakai).
            </div>
          )}
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
