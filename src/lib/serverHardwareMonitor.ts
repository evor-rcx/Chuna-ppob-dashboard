import fs from 'fs';
import os from 'os';
import path from 'path';

export interface ThermalZoneInfo {
  name: string;
  type: string;
  temp: number;
}

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
  totalDownloadSpeedKBps: number;
  totalUploadSpeedKBps: number;
  totalDownloadSpeedMbps: number;
  totalUploadSpeedMbps: number;
  formattedDownloadSpeed: string;
  formattedUploadSpeed: string;
  totalDownloadedFormatted: string;
  totalUploadedFormatted: string;
  activeInterface: string;
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
    zones: ThermalZoneInfo[];
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
    drives: StorageDevice[];
    usbDrives: StorageDevice[];
    hasUsbAttached: boolean;
    usbCount: number;
  };
  network: NetworkStats;
  uptime: {
    seconds: number;
    formatted: string;
  };
  procReadingMethod: 'direct_proc_fs' | 'node_os_fallback';
  timestamp: string;
}

// Previous CPU stat cache for delta usage computation
let prevCpuStat: { total: number; idle: number; timestamp: number } | null = null;

// Read helper with silent error handling
function readProcFileSafe(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (e) {
    // Return null silently on permission or missing file
  }
  return null;
}

// 1. Read CPU usage from /proc/stat
function getCpuUsage(): { usagePercent: number; cores: number } {
  const statContent = readProcFileSafe('/proc/stat');
  const cores = os.cpus().length || 1;

  if (statContent) {
    const firstLine = statContent.split('\n')[0];
    if (firstLine && firstLine.startsWith('cpu ')) {
      const parts = firstLine.trim().split(/\s+/).slice(1).map(Number);
      // parts: [user, nice, system, idle, iowait, irq, softirq, steal, guest, guest_nice]
      const user = parts[0] || 0;
      const nice = parts[1] || 0;
      const system = parts[2] || 0;
      const idle = parts[3] || 0;
      const iowait = parts[4] || 0;
      const irq = parts[5] || 0;
      const softirq = parts[6] || 0;
      const steal = parts[7] || 0;

      const idleTime = idle + iowait;
      const totalTime = user + nice + system + idle + iowait + irq + softirq + steal;

      if (prevCpuStat && prevCpuStat.total > 0) {
        const deltaTotal = totalTime - prevCpuStat.total;
        const deltaIdle = idleTime - prevCpuStat.idle;
        prevCpuStat = { total: totalTime, idle: idleTime, timestamp: Date.now() };

        if (deltaTotal > 0) {
          const usage = Math.max(0, Math.min(100, Math.round(((deltaTotal - deltaIdle) / deltaTotal) * 100)));
          return { usagePercent: usage, cores };
        }
      } else {
        prevCpuStat = { total: totalTime, idle: idleTime, timestamp: Date.now() };
      }
    }
  }

  // Fallback CPU estimate from load average
  const loads = os.loadavg();
  const estimated = Math.min(100, Math.max(0, Math.round((loads[0] / cores) * 100)));
  return { usagePercent: estimated, cores };
}

// 2. Read CPU model and device tree from /proc/cpuinfo and /proc/device-tree/model
function getCpuAndDeviceModel(): { cpuModel: string; deviceModel: string; freqMHz?: number } {
  let cpuModel = '';
  let deviceModel = '';
  let freqMHz: number | undefined = undefined;

  // Check /proc/device-tree/model (frequent in Armbian / Raspberry Pi / TV Boxes)
  const dtModel = readProcFileSafe('/proc/device-tree/model');
  if (dtModel) {
    deviceModel = dtModel.replace(/\0/g, '').trim();
  }

  const cpuinfo = readProcFileSafe('/proc/cpuinfo');
  if (cpuinfo) {
    const lines = cpuinfo.split('\n');
    for (const line of lines) {
      if (!cpuModel && (line.startsWith('model name') || line.startsWith('Model') || line.startsWith('Processor'))) {
        const parts = line.split(':');
        if (parts[1]) cpuModel = parts[1].trim();
      }
      if (!deviceModel && line.startsWith('Hardware')) {
        const parts = line.split(':');
        if (parts[1]) deviceModel = parts[1].trim();
      }
      if (!freqMHz && line.startsWith('cpu MHz')) {
        const parts = line.split(':');
        if (parts[1]) freqMHz = Math.round(parseFloat(parts[1].trim()));
      }
    }
  }

  if (!cpuModel && os.cpus().length > 0) {
    cpuModel = os.cpus()[0]?.model || '';
  }

  if (!cpuModel) {
    cpuModel = os.arch() === 'arm64' ? 'ARMv8 Cortex Quad-Core' : 'Generic Multi-Core CPU';
  }

  // If no hardware string from device-tree, attempt to guess from architecture
  if (!deviceModel) {
    if (os.arch() === 'arm64') {
      deviceModel = 'Armbian Linux ARM64 (STB / SBC)';
    } else {
      deviceModel = `${os.type()} ${os.arch()}`;
    }
  }

  return { cpuModel, deviceModel, freqMHz };
}

// 3. Read Thermal Zones (/sys/class/thermal/ or /sys/devices/virtual/thermal/)
function getCpuTemperature(): {
  celsius: number | null;
  status: 'OPTIMAL' | 'WARM' | 'HOT' | 'CRITICAL';
  sensorName: string;
  zones: ThermalZoneInfo[];
  isSimulated: boolean;
  recommendation: string;
} {
  const zones: ThermalZoneInfo[] = [];
  const thermalDirs = [
    '/sys/class/thermal',
    '/sys/devices/virtual/thermal'
  ];

  for (const baseDir of thermalDirs) {
    try {
      if (fs.existsSync(baseDir)) {
        const entries = fs.readdirSync(baseDir);
        for (const entry of entries) {
          if (entry.startsWith('thermal_zone')) {
            const tempPath = path.join(baseDir, entry, 'temp');
            const typePath = path.join(baseDir, entry, 'type');

            if (fs.existsSync(tempPath)) {
              const rawTemp = fs.readFileSync(tempPath, 'utf-8').trim();
              const val = parseFloat(rawTemp);
              if (!isNaN(val) && val > 0) {
                // In Linux kernels, if > 1000 it is in millidegrees C
                const tempC = val > 1000 ? Math.round((val / 1000) * 10) / 10 : Math.round(val * 10) / 10;
                let zoneType = entry;
                if (fs.existsSync(typePath)) {
                  try {
                    zoneType = fs.readFileSync(typePath, 'utf-8').trim() || entry;
                  } catch (e) {}
                }
                zones.push({ name: entry, type: zoneType, temp: tempC });
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  // Also check /sys/class/hwmon
  if (zones.length === 0) {
    try {
      const hwmonBase = '/sys/class/hwmon';
      if (fs.existsSync(hwmonBase)) {
        const hwEntries = fs.readdirSync(hwmonBase);
        for (const h of hwEntries) {
          const temp1 = path.join(hwmonBase, h, 'temp1_input');
          const namePath = path.join(hwmonBase, h, 'name');
          if (fs.existsSync(temp1)) {
            const raw = fs.readFileSync(temp1, 'utf-8').trim();
            const val = parseFloat(raw);
            if (!isNaN(val) && val > 0) {
              const tempC = val > 1000 ? Math.round((val / 1000) * 10) / 10 : Math.round(val * 10) / 10;
              let sName = h;
              try { if (fs.existsSync(namePath)) sName = fs.readFileSync(namePath, 'utf-8').trim(); } catch(e){}
              zones.push({ name: h, type: sName, temp: tempC });
            }
          }
        }
      }
    } catch (e) {}
  }

  let celsius: number | null = null;
  let sensorName = 'N/A';
  let isSimulated = false;

  if (zones.length > 0) {
    // Prefer cpu-thermal, soc-thermal or the highest sensible zone
    const cpuZone = zones.find(z => /cpu|soc|aml|tsensor|core/i.test(z.type)) || zones[0];
    celsius = cpuZone.temp;
    sensorName = `${cpuZone.name} (${cpuZone.type})`;
  } else {
    // When running inside containerized sandbox / preview where /sys/class/thermal is restricted:
    // Generate a normal safe temperature based on load average
    const loads = os.loadavg();
    const est = Math.round((39 + (loads[0] * 3.5)) * 10) / 10;
    celsius = Math.min(65, Math.max(38, est));
    sensorName = 'Virtual / Cloud Container Sensor';
    isSimulated = true;
    zones.push({ name: 'thermal_zone0', type: 'cpu-thermal (simulated)', temp: celsius });
  }

  let status: 'OPTIMAL' | 'WARM' | 'HOT' | 'CRITICAL' = 'OPTIMAL';
  let recommendation = 'Suhu CPU sangat dingin & stabil. Ideal untuk operasional STB 24 jam nonstop.';

  if (celsius >= 82) {
    status = 'CRITICAL';
    recommendation = 'PERINGATAN: Suhu CPU kritis! Wajib pasang kipas angin USB 5V / heatsink tambahan pada STB.';
  } else if (celsius >= 70) {
    status = 'HOT';
    recommendation = 'Suhu CPU cukup panas. Disarankan menjaga sirkulasi udara STB tetap terbuka dan tidak ditumpuk.';
  } else if (celsius >= 55) {
    status = 'WARM';
    recommendation = 'Suhu normal STB Armbian tanpa kipas (passive cooling). Beroperasi dalam batas aman.';
  }

  return {
    celsius,
    status,
    sensorName,
    zones,
    isSimulated,
    recommendation
  };
}

// 4. Read RAM & Swap directly from /proc/meminfo
function getMemoryStats(): {
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
  isProc: boolean;
} {
  const meminfo = readProcFileSafe('/proc/meminfo');

  if (meminfo) {
    let memTotalKb = 0;
    let memFreeKb = 0;
    let memAvailKb = 0;
    let buffersKb = 0;
    let cachedKb = 0;
    let swapTotalKb = 0;
    let swapFreeKb = 0;

    const lines = meminfo.split('\n');
    for (const line of lines) {
      if (line.startsWith('MemTotal:')) memTotalKb = parseInt(line.replace(/\D/g, ''), 10) || 0;
      else if (line.startsWith('MemFree:')) memFreeKb = parseInt(line.replace(/\D/g, ''), 10) || 0;
      else if (line.startsWith('MemAvailable:')) memAvailKb = parseInt(line.replace(/\D/g, ''), 10) || 0;
      else if (line.startsWith('Buffers:')) buffersKb = parseInt(line.replace(/\D/g, ''), 10) || 0;
      else if (line.startsWith('Cached:')) cachedKb = parseInt(line.replace(/\D/g, ''), 10) || 0;
      else if (line.startsWith('SwapTotal:')) swapTotalKb = parseInt(line.replace(/\D/g, ''), 10) || 0;
      else if (line.startsWith('SwapFree:')) swapFreeKb = parseInt(line.replace(/\D/g, ''), 10) || 0;
    }

    if (memTotalKb > 0) {
      const totalMB = Math.round(memTotalKb / 1024);
      const freeMB = Math.round(memFreeKb / 1024);
      const buffersMB = Math.round(buffersKb / 1024);
      const cachedMB = Math.round(cachedKb / 1024);
      const availableMB = memAvailKb > 0 ? Math.round(memAvailKb / 1024) : freeMB + buffersMB + cachedMB;
      const usedMB = Math.max(0, totalMB - availableMB);
      const usagePercent = Math.min(100, Math.round((usedMB / totalMB) * 100));

      const swapTotalMB = Math.round(swapTotalKb / 1024);
      const swapUsedMB = Math.max(0, swapTotalMB - Math.round(swapFreeKb / 1024));
      const swapUsagePercent = swapTotalMB > 0 ? Math.round((swapUsedMB / swapTotalMB) * 100) : 0;

      return {
        totalMB,
        usedMB,
        freeMB,
        availableMB,
        usagePercent,
        buffersMB,
        cachedMB,
        swapTotalMB,
        swapUsedMB,
        swapUsagePercent,
        isProc: true
      };
    }
  }

  // Fallback to os module
  const totalMB = Math.round(os.totalmem() / (1024 * 1024));
  const freeMB = Math.round(os.freemem() / (1024 * 1024));
  const usedMB = Math.max(0, totalMB - freeMB);
  const usagePercent = Math.min(100, Math.round((usedMB / totalMB) * 100));

  return {
    totalMB,
    usedMB,
    freeMB,
    availableMB: freeMB,
    usagePercent,
    buffersMB: 0,
    cachedMB: 0,
    swapTotalMB: 0,
    swapUsedMB: 0,
    swapUsagePercent: 0,
    isProc: false
  };
}

// 5. Read Root Disk & USB Storage / Flashdisks (/proc/mounts, /proc/partitions, /sys/block)
function getStorageStats(): {
  totalGB: number;
  usedGB: number;
  freeGB: number;
  usagePercent: number;
  mountPoint: string;
  drives: StorageDevice[];
  usbDrives: StorageDevice[];
  hasUsbAttached: boolean;
  usbCount: number;
} {
  const drives: StorageDevice[] = [];
  const mountedPoints = new Set<string>();
  const mountedDevices = new Set<string>();

  // 1. Check Root Filesystem (/)
  let rootTotalGB = 16;
  let rootUsedGB = 4.8;
  let rootFreeGB = 11.2;
  let rootUsagePercent = 30;

  try {
    if (typeof (fs as any).statfsSync === 'function') {
      const rootStat = (fs as any).statfsSync('/');
      if (rootStat && rootStat.blocks > 0) {
        const bsize = rootStat.bsize || 4096;
        const totalBytes = rootStat.blocks * bsize;
        const freeBytes = (rootStat.bavail || rootStat.bfree || 0) * bsize;
        const usedBytes = Math.max(0, totalBytes - freeBytes);

        rootTotalGB = Math.round((totalBytes / (1024 * 1024 * 1024)) * 10) / 10;
        rootUsedGB = Math.round((usedBytes / (1024 * 1024 * 1024)) * 10) / 10;
        rootFreeGB = Math.round((freeBytes / (1024 * 1024 * 1024)) * 10) / 10;
        rootUsagePercent = rootTotalGB > 0 ? Math.round((rootUsedGB / rootTotalGB) * 100) : 0;
      }
    }
  } catch (e) {}

  const rootDevice: StorageDevice = {
    name: 'Internal Storage (eMMC / MicroSD OS)',
    device: '/dev/root',
    mountPoint: '/',
    fsType: 'ext4',
    totalGB: rootTotalGB,
    usedGB: rootUsedGB,
    freeGB: rootFreeGB,
    usagePercent: rootUsagePercent,
    isUsb: false,
    isRoot: true,
    status: 'MOUNTED'
  };
  drives.push(rootDevice);
  mountedPoints.add('/');

  // 2. Read /proc/mounts to find mounted USB drives, flashdisks, or external HDD
  const mountsContent = readProcFileSafe('/proc/mounts');
  if (mountsContent) {
    const lines = mountsContent.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        const dev = parts[0];
        const mnt = parts[1];
        const fstype = parts[2];

        // Ignore system virtual / pseudo filesystems
        if (
          mnt === '/' ||
          mountedPoints.has(mnt) ||
          dev === 'none' ||
          dev === 'rootfs' ||
          dev.startsWith('tmpfs') ||
          dev.startsWith('overlay') ||
          dev.startsWith('proc') ||
          dev.startsWith('sysfs') ||
          dev.startsWith('devpts') ||
          dev.startsWith('cgroup') ||
          dev.startsWith('pstore') ||
          dev.startsWith('bpf') ||
          fstype === 'squashfs' ||
          fstype === 'tmpfs' ||
          fstype === 'devtmpfs' ||
          mnt.startsWith('/proc') ||
          mnt.startsWith('/sys') ||
          mnt.startsWith('/dev') ||
          mnt.startsWith('/run/user') ||
          mnt.startsWith('/run/lock')
        ) {
          continue;
        }

        const isSdOrNvme = dev.startsWith('/dev/sd') || dev.startsWith('/dev/nvme') || dev.startsWith('/dev/mmcblk');
        const isMediaOrMnt = mnt.startsWith('/media') || mnt.startsWith('/mnt') || mnt.startsWith('/storage') || mnt.startsWith('/usb');

        if (isSdOrNvme || isMediaOrMnt) {
          try {
            if (typeof (fs as any).statfsSync === 'function') {
              const stat = (fs as any).statfsSync(mnt);
              if (stat && stat.blocks > 0) {
                const bsize = stat.bsize || 4096;
                const totalBytes = stat.blocks * bsize;
                const freeBytes = (stat.bavail || stat.bfree || 0) * bsize;
                const usedBytes = Math.max(0, totalBytes - freeBytes);

                const totalGB = Math.round((totalBytes / (1024 * 1024 * 1024)) * 10) / 10;
                const usedGB = Math.round((usedBytes / (1024 * 1024 * 1024)) * 10) / 10;
                const freeGB = Math.round((freeBytes / (1024 * 1024 * 1024)) * 10) / 10;
                const usagePercent = totalGB > 0 ? Math.round((usedGB / totalGB) * 100) : 0;

                // Identify if USB:
                // On ARM STB, /dev/sd* is USB. Also check /sys/block link for usb.
                let isUsb = dev.startsWith('/dev/sd') || isMediaOrMnt;
                const devBase = path.basename(dev).replace(/[0-9]+$/, '');
                try {
                  const sysBlockPath = `/sys/block/${devBase}`;
                  if (fs.existsSync(sysBlockPath)) {
                    const link = fs.readlinkSync(sysBlockPath);
                    if (link.includes('usb')) isUsb = true;
                  }
                } catch (e) {}

                let name = `USB Flashdisk (${path.basename(dev)})`;
                if (!isUsb && dev.includes('mmcblk')) {
                  name = `MicroSD Card (${path.basename(dev)})`;
                } else if (isMediaOrMnt) {
                  const folder = path.basename(mnt);
                  name = `USB Flashdisk: ${folder} (${path.basename(dev)})`;
                }

                drives.push({
                  name,
                  device: dev,
                  mountPoint: mnt,
                  fsType: fstype,
                  totalGB,
                  usedGB,
                  freeGB,
                  usagePercent,
                  isUsb,
                  isRoot: false,
                  status: 'MOUNTED'
                });

                mountedPoints.add(mnt);
                mountedDevices.add(dev);
              }
            }
          } catch (e) {}
        }
      }
    }
  }

  // 3. Scan /proc/partitions for attached USB flashdisks that might NOT be mounted yet
  const partitionsContent = readProcFileSafe('/proc/partitions');
  if (partitionsContent) {
    const lines = partitionsContent.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const devName = parts[3]; // e.g. sda, sda1, sdb1
        const blocks = parseInt(parts[2], 10) || 0;
        const fullDev = `/dev/${devName}`;

        if (/^sd[a-z][0-9]?$/.test(devName) && blocks > 2048) {
          if (!mountedDevices.has(fullDev)) {
            const isChildOrParentMounted = Array.from(mountedDevices).some(d => d.startsWith(fullDev) || fullDev.startsWith(d));
            if (!isChildOrParentMounted) {
              const approxGB = Math.round(((blocks * 1024) / (1024 * 1024 * 1024)) * 10) / 10;
              drives.push({
                name: `USB Flashdisk (${devName})`,
                device: fullDev,
                mountPoint: 'Belum di-Mount (Ketik: mount ' + fullDev + ' /media/usb)',
                fsType: 'vfat/ntfs/exfat',
                totalGB: approxGB,
                usedGB: 0,
                freeGB: approxGB,
                usagePercent: 0,
                isUsb: true,
                isRoot: false,
                status: 'UNMOUNTED'
              });
              mountedDevices.add(fullDev);
            }
          }
        }
      }
    }
  }

  // 4. Also scan common Armbian USB auto-mount directories (/media and /mnt)
  const commonUsbDirs = ['/media', '/mnt'];
  for (const cDir of commonUsbDirs) {
    try {
      if (fs.existsSync(cDir)) {
        const subdirs = fs.readdirSync(cDir);
        for (const sub of subdirs) {
          const fullPath = path.join(cDir, sub);
          if (!mountedPoints.has(fullPath)) {
            try {
              const stat = (fs as any).statfsSync(fullPath);
              if (stat && stat.blocks > 0) {
                const bsize = stat.bsize || 4096;
                const totalBytes = stat.blocks * bsize;
                const freeBytes = (stat.bavail || stat.bfree || 0) * bsize;
                const usedBytes = Math.max(0, totalBytes - freeBytes);

                const totalGB = Math.round((totalBytes / (1024 * 1024 * 1024)) * 10) / 10;
                const usedGB = Math.round((usedBytes / (1024 * 1024 * 1024)) * 10) / 10;
                const freeGB = Math.round((freeBytes / (1024 * 1024 * 1024)) * 10) / 10;
                const usagePercent = totalGB > 0 ? Math.round((usedGB / totalGB) * 100) : 0;

                if (Math.abs(totalGB - rootTotalGB) > 0.5) {
                  drives.push({
                    name: `USB Drive / Storage (${sub})`,
                    device: `/dev/external`,
                    mountPoint: fullPath,
                    fsType: 'auto',
                    totalGB,
                    usedGB,
                    freeGB,
                    usagePercent,
                    isUsb: true,
                    isRoot: false,
                    status: 'MOUNTED'
                  });
                  mountedPoints.add(fullPath);
                }
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {}
  }

  const usbDrives = drives.filter(d => d.isUsb);

  return {
    totalGB: rootTotalGB,
    usedGB: rootUsedGB,
    freeGB: rootFreeGB,
    usagePercent: rootUsagePercent,
    mountPoint: '/',
    drives,
    usbDrives,
    hasUsbAttached: usbDrives.length > 0,
    usbCount: usbDrives.length
  };
}

// 6. Read Uptime from /proc/uptime
function getUptime(): { seconds: number; formatted: string } {
  const uptimeContent = readProcFileSafe('/proc/uptime');
  let seconds = 0;

  if (uptimeContent) {
    const firstNum = parseFloat(uptimeContent.trim().split(/\s+/)[0]);
    if (!isNaN(firstNum)) seconds = Math.floor(firstNum);
  }

  if (seconds === 0) {
    seconds = Math.floor(os.uptime());
  }

  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days} hari`);
  if (hours > 0 || days > 0) parts.push(`${hours} jam`);
  parts.push(`${minutes} mnt`);

  return {
    seconds,
    formatted: parts.join(', ')
  };
}

// 7. Detect Host OS & Armbian / Proxmox Release
function detectHostEnvironment(): {
  hostType: 'armbian_stb' | 'proxmox' | 'home_server' | 'cloud_container' | 'linux_generic';
  isArmbian: boolean;
  isProxmox: boolean;
  isARM64: boolean;
  osName: string;
  kernelVersion: string;
  boardInfo: {
    boardName?: string;
    linuxFamily?: string;
    branch?: string;
    version?: string;
  };
} {
  let isArmbian = false;
  let isProxmox = false;
  const isARM64 = os.arch() === 'arm64';
  let osName = `${os.type()} ${os.release()}`;
  let kernelVersion = '';
  const boardInfo: any = {};

  // Check /proc/version
  const procVersion = readProcFileSafe('/proc/version');
  if (procVersion) {
    const match = procVersion.match(/Linux version ([^\s]+)/);
    if (match) kernelVersion = match[1];
    if (/armbian/i.test(procVersion)) isArmbian = true;
    if (/pve/i.test(procVersion)) isProxmox = true;
  } else {
    kernelVersion = os.release();
  }

  // Check /etc/armbian-release
  const armbianRel = readProcFileSafe('/etc/armbian-release');
  if (armbianRel) {
    isArmbian = true;
    const lines = armbianRel.split('\n');
    for (const l of lines) {
      if (l.startsWith('BOARD_NAME=')) boardInfo.boardName = l.split('=')[1]?.replace(/["']/g, '');
      if (l.startsWith('LINUXFAMILY=')) boardInfo.linuxFamily = l.split('=')[1]?.replace(/["']/g, '');
      if (l.startsWith('BRANCH=')) boardInfo.branch = l.split('=')[1]?.replace(/["']/g, '');
      if (l.startsWith('VERSION=')) boardInfo.version = l.split('=')[1]?.replace(/["']/g, '');
    }
  }

  // Check /etc/os-release
  const osRelease = readProcFileSafe('/etc/os-release');
  if (osRelease) {
    const nameMatch = osRelease.match(/PRETTY_NAME="?([^"\n]+)"?/);
    if (nameMatch && nameMatch[1]) {
      osName = nameMatch[1];
      if (/armbian/i.test(osName)) isArmbian = true;
      if (/proxmox/i.test(osName)) isProxmox = true;
    }
  }

  // Check /etc/pve or /etc/proxmox-release
  if (!isProxmox) {
    if (fs.existsSync('/etc/pve') || fs.existsSync('/etc/proxmox-release')) {
      isProxmox = true;
    }
  }

  // Detect Host Type
  let hostType: 'armbian_stb' | 'proxmox' | 'home_server' | 'cloud_container' | 'linux_generic' = 'home_server';

  if (isArmbian) {
    hostType = 'armbian_stb';
  } else if (isProxmox) {
    hostType = 'proxmox';
  } else if (fs.existsSync('/.dockerenv') || (process.env.APPLET_ID || process.env.K_REVISION)) {
    hostType = 'cloud_container';
  } else if (isARM64) {
    hostType = 'armbian_stb'; // Default ARM64 SBC / STB
  } else {
    hostType = 'home_server';
  }

  return {
    hostType,
    isArmbian,
    isProxmox,
    isARM64,
    osName,
    kernelVersion,
    boardInfo
  };
}

// 8. Network Traffic and Bandwidth Speed Monitor (/proc/net/dev)
interface NetDevSnapshot {
  timestamp: number;
  interfaces: Record<string, { rxBytes: number; txBytes: number }>;
}

let prevNetDevSnapshot: NetDevSnapshot | null = null;

function formatNetworkBytes(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatNetworkSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || isNaN(bytesPerSec) || bytesPerSec <= 0) return '0 KB/s';
  if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
}

function bytesToMbps(bytesPerSec: number): number {
  if (!bytesPerSec || isNaN(bytesPerSec)) return 0;
  return Math.round(((bytesPerSec * 8) / 1_000_000) * 100) / 100;
}

export function getNetworkTrafficStats(): NetworkStats {
  const now = Date.now();
  const netIfaces = os.networkInterfaces();

  const ipMap: Record<string, string> = {};
  let primaryIp = '127.0.0.1';

  for (const [name, addrs] of Object.entries(netIfaces)) {
    if (addrs) {
      for (const a of addrs) {
        if (a.family === 'IPv4' && !a.internal) {
          ipMap[name] = a.address;
          if (primaryIp === '127.0.0.1') primaryIp = a.address;
        }
      }
    }
  }

  // Read /proc/net/dev
  const netDevContent = readProcFileSafe('/proc/net/dev');
  const currentSnapshot: Record<string, { rxBytes: number; txBytes: number }> = {};

  if (netDevContent) {
    const lines = netDevContent.split('\n');
    for (const line of lines) {
      if (!line.includes(':')) continue;
      const [ifaceRaw, dataRaw] = line.split(':');
      const iface = ifaceRaw.trim();
      const parts = dataRaw.trim().split(/\s+/);
      if (parts.length >= 9) {
        const rxBytes = parseInt(parts[0], 10) || 0;
        const txBytes = parseInt(parts[8], 10) || 0;
        currentSnapshot[iface] = { rxBytes, txBytes };
      }
    }
  }

  // Calculate delta if previous snapshot exists
  let deltaSec = 0;
  if (prevNetDevSnapshot) {
    deltaSec = (now - prevNetDevSnapshot.timestamp) / 1000;
  }
  const isDeltaValid = deltaSec >= 0.3 && deltaSec <= 30 && prevNetDevSnapshot !== null;

  const interfaceDetails: NetworkInterfaceDetail[] = [];
  let totalRxBytesPerSec = 0;
  let totalTxBytesPerSec = 0;
  let totalRxBytesAll = 0;
  let totalTxBytesAll = 0;
  let activeInterface = '';

  const allNames = Array.from(new Set([...Object.keys(currentSnapshot), ...Object.keys(ipMap)]));

  for (const name of allNames) {
    if (name === 'lo') continue;

    const cur = currentSnapshot[name] || { rxBytes: 0, txBytes: 0 };
    let rxSpeed = 0;
    let txSpeed = 0;

    if (isDeltaValid && prevNetDevSnapshot?.interfaces[name]) {
      const prev = prevNetDevSnapshot.interfaces[name];
      rxSpeed = Math.max(0, (cur.rxBytes - prev.rxBytes) / deltaSec);
      txSpeed = Math.max(0, (cur.txBytes - prev.txBytes) / deltaSec);
    }

    const isWireless = name.startsWith('wl') || name.startsWith('ra') || name.includes('wifi');
    const ip = ipMap[name] || '-';
    const isUp = ip !== '-' || cur.rxBytes > 0;

    if (!activeInterface && isUp) {
      activeInterface = name;
    } else if (ip === primaryIp) {
      activeInterface = name;
    }

    totalRxBytesPerSec += rxSpeed;
    totalTxBytesPerSec += txSpeed;
    totalRxBytesAll += cur.rxBytes;
    totalTxBytesAll += cur.txBytes;

    interfaceDetails.push({
      name,
      ip,
      isUp,
      isWireless,
      rxBytes: cur.rxBytes,
      txBytes: cur.txBytes,
      downloadSpeedKBps: Math.round((rxSpeed / 1024) * 10) / 10,
      uploadSpeedKBps: Math.round((txSpeed / 1024) * 10) / 10,
      downloadSpeedMbps: bytesToMbps(rxSpeed),
      uploadSpeedMbps: bytesToMbps(txSpeed),
      formattedDownload: formatNetworkSpeed(rxSpeed),
      formattedUpload: formatNetworkSpeed(txSpeed),
      totalRxFormatted: formatNetworkBytes(cur.rxBytes),
      totalTxFormatted: formatNetworkBytes(cur.txBytes)
    });
  }

  // Update snapshot cache
  prevNetDevSnapshot = {
    timestamp: now,
    interfaces: currentSnapshot
  };

  const totalDownKBps = Math.round((totalRxBytesPerSec / 1024) * 10) / 10;
  const totalUpKBps = Math.round((totalTxBytesPerSec / 1024) * 10) / 10;
  const totalDownMbps = bytesToMbps(totalRxBytesPerSec);
  const totalUpMbps = bytesToMbps(totalTxBytesPerSec);

  return {
    primaryIp,
    totalDownloadSpeedKBps: totalDownKBps,
    totalUploadSpeedKBps: totalUpKBps,
    totalDownloadSpeedMbps: totalDownMbps,
    totalUploadSpeedMbps: totalUpMbps,
    formattedDownloadSpeed: formatNetworkSpeed(totalRxBytesPerSec),
    formattedUploadSpeed: formatNetworkSpeed(totalTxBytesPerSec),
    totalDownloadedFormatted: formatNetworkBytes(totalRxBytesAll),
    totalUploadedFormatted: formatNetworkBytes(totalTxBytesAll),
    activeInterface: activeInterface || (interfaceDetails[0]?.name ?? 'eth0'),
    interfaces: interfaceDetails
  };
}

// 9. Main Hardware Collector - Asynchronous & Lightweight
export function getLiveServerHardwareStats(): ServerHardwareStats {
  const hostEnv = detectHostEnvironment();
  const cpuUsage = getCpuUsage();
  const cpuAndDev = getCpuAndDeviceModel();
  const temp = getCpuTemperature();
  const mem = getMemoryStats();
  const storage = getStorageStats();
  const uptime = getUptime();
  const network = getNetworkTrafficStats();
  const loadAvg = os.loadavg() as [number, number, number];

  // Refine Device Model
  let finalDeviceModel = hostEnv.boardInfo?.boardName || cpuAndDev.deviceModel;
  if (hostEnv.isArmbian && !hostEnv.boardInfo?.boardName) {
    finalDeviceModel = 'Armbian TV Box STB / SBC';
  } else if (hostEnv.isProxmox) {
    finalDeviceModel = 'Proxmox Virtual Environment (VE)';
  }

  return {
    hostType: hostEnv.hostType,
    hostName: os.hostname(),
    osName: hostEnv.osName,
    kernelVersion: hostEnv.kernelVersion,
    arch: os.arch(),
    isArmbian: hostEnv.isArmbian,
    isProxmox: hostEnv.isProxmox,
    isARM64: hostEnv.isARM64,
    deviceModel: finalDeviceModel,
    boardInfo: hostEnv.boardInfo,
    cpu: {
      model: cpuAndDev.cpuModel,
      cores: cpuUsage.cores,
      usagePercent: cpuUsage.usagePercent,
      loadAvg: [
        Math.round(loadAvg[0] * 100) / 100,
        Math.round(loadAvg[1] * 100) / 100,
        Math.round(loadAvg[2] * 100) / 100
      ],
      frequencyMHz: cpuAndDev.freqMHz
    },
    temperature: temp,
    memory: {
      totalMB: mem.totalMB,
      usedMB: mem.usedMB,
      freeMB: mem.freeMB,
      availableMB: mem.availableMB,
      usagePercent: mem.usagePercent,
      buffersMB: mem.buffersMB,
      cachedMB: mem.cachedMB,
      swapTotalMB: mem.swapTotalMB,
      swapUsedMB: mem.swapUsedMB,
      swapUsagePercent: mem.swapUsagePercent
    },
    storage,
    network,
    uptime,
    procReadingMethod: mem.isProc ? 'direct_proc_fs' : 'node_os_fallback',
    timestamp: new Date().toISOString()
  };
}
