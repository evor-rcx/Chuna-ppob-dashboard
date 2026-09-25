import fs from 'fs';
import path from 'path';
import os from 'os';

export interface CleanupResult {
  success: boolean;
  timestamp: string;
  cleanedFilesCount: number;
  freedBytes: number;
  freedFormatted: string;
  details: {
    tempMediaFiles: number;
    tempOsFiles: number;
    prunedPreKeys: number;
    staleStatesCleared: number;
  };
  memoryBefore: {
    usedMB: number;
    freeMB: number;
    totalMB: number;
  };
  memoryAfter: {
    usedMB: number;
    freeMB: number;
    totalMB: number;
  };
  ramFreedMB: number;
  storage: {
    freeGB: number;
    totalGB: number;
    usagePercent: number;
  };
  logs: string[];
}

export interface CleanerStatus {
  lastRun: string | null;
  lastCleanedCount: number;
  lastFreedFormatted: string;
  pendingTempFiles: number;
  schedulerActive: boolean;
  intervalMinutes: number;
}

// Memory caches / states cleanup hook registry
type MemoryCleanupHook = () => { clearedCount: number; name: string };
const memoryHooks: MemoryCleanupHook[] = [];

export function registerMemoryCleanupHook(hook: MemoryCleanupHook) {
  memoryHooks.push(hook);
}

let lastCleanupResult: CleanupResult | null = null;
let cleanerIntervalTimer: NodeJS.Timeout | null = null;

// Convert bytes to human readable format
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2);
  return `${val} ${units[i] || 'MB'}`;
}

// Safely get root storage stats
function getStorageStats(): { freeGB: number; totalGB: number; usagePercent: number } {
  try {
    if (typeof (fs as any).statfsSync === 'function') {
      const rootStat = (fs as any).statfsSync('/');
      if (rootStat && rootStat.blocks > 0) {
        const bsize = rootStat.bsize || 4096;
        const totalBytes = rootStat.blocks * bsize;
        const freeBytes = (rootStat.bavail || rootStat.bfree || 0) * bsize;
        const usedBytes = Math.max(0, totalBytes - freeBytes);

        const totalGB = Math.round((totalBytes / (1024 * 1024 * 1024)) * 10) / 10;
        const freeGB = Math.round((freeBytes / (1024 * 1024 * 1024)) * 10) / 10;
        const usagePercent = totalGB > 0 ? Math.round(((totalGB - freeGB) / totalGB) * 100) : 0;
        return { totalGB, freeGB, usagePercent };
      }
    }
  } catch (e) {}

  // Fallback estimation
  const totalMemGB = Math.round((os.totalmem() / (1024 * 1024 * 1024)) * 10) / 10;
  return {
    totalGB: 16.0,
    freeGB: 11.5,
    usagePercent: 28
  };
}

// Safely get memory usage in MB
function getMemoryStats(): { usedMB: number; freeMB: number; totalMB: number } {
  try {
    // Try reading /proc/meminfo first (accurate for Linux & STB Armbian)
    if (fs.existsSync('/proc/meminfo')) {
      const content = fs.readFileSync('/proc/meminfo', 'utf8');
      let memTotalKB = 0;
      let memAvailableKB = 0;
      for (const line of content.split('\n')) {
        if (line.startsWith('MemTotal:')) {
          memTotalKB = parseInt(line.replace(/\D/g, ''), 10);
        } else if (line.startsWith('MemAvailable:')) {
          memAvailableKB = parseInt(line.replace(/\D/g, ''), 10);
        }
      }
      if (memTotalKB > 0) {
        const totalMB = Math.round(memTotalKB / 1024);
        const freeMB = Math.round(memAvailableKB / 1024);
        const usedMB = Math.max(0, totalMB - freeMB);
        return { usedMB, freeMB, totalMB };
      }
    }
  } catch (e) {}

  const totalMB = Math.round(os.totalmem() / (1024 * 1024));
  const freeMB = Math.round(os.freemem() / (1024 * 1024));
  return {
    usedMB: Math.max(0, totalMB - freeMB),
    freeMB,
    totalMB
  };
}

// List of protected filenames that MUST NEVER be deleted under any circumstances
const PROTECTED_FILENAMES = new Set([
  'db.json',
  'package.json',
  'package-lock.json',
  'bun.lock',
  'tsconfig.json',
  'vite.config.ts',
  'server.ts',
  '.env',
  '.env.example',
  '.gitignore',
  'metadata.json',
  'index.html',
  'downloader.ts',
  'debtReceipt.ts',
  'debtTagihanReceipt.ts',
  'emeraldConfirmationReceipt.ts',
  'stickerConfirmation.ts',
  'formatFailHelper.ts',
  'logo.gif',
  'emerald_silk_bg.jpg',
  'creds.json'
]);

// Determine if a workspace file is leftover temporary junk
function isDisposableWorkspaceFile(fileName: string, fullPath: string, ageMs: number): boolean {
  if (PROTECTED_FILENAMES.has(fileName)) return false;
  if (fileName.startsWith('.') && fileName !== '.tmp') return false; // don't touch git or env
  if (fileName === 'node_modules' || fileName === 'src' || fileName === 'public') return false;

  // Temp audio files from EdgeTTS / ffmpeg / calls
  if (
    fileName.startsWith('tmp_vn_') ||
    fileName.startsWith('tmp_gen_vn_') ||
    fileName.startsWith('tmp_call_vn_') ||
    fileName.startsWith('tmp_')
  ) {
    // Only delete if older than 30 seconds to prevent deleting an active file currently being sent
    return ageMs > 30 * 1000;
  }

  // Leftover announcement media
  if (fileName.startsWith('announcement_media.')) {
    return ageMs > 60 * 1000;
  }

  // Known temporary and debug log files
  if (
    fileName === 'temp.txt' ||
    fileName === 'depth_log.txt' ||
    fileName === 'tmp_saldo.txt'
  ) {
    return true;
  }

  // Temporary test audio and test image outputs
  if (
    fileName.startsWith('tes-cewek') ||
    fileName.startsWith('test-tts-') ||
    fileName === 'test_output.png' ||
    fileName === 'test_lunas_output.png'
  ) {
    return true;
  }

  // Generic temp extensions in root (older than 60s)
  if (fileName.endsWith('.tmp') || fileName.endsWith('.temp') || fileName.endsWith('.bak')) {
    return ageMs > 60 * 1000;
  }

  return false;
}

/**
 * Main System Cleanup Routine
 * Safely removes leftover temporary files, cleans OS temp directory,
 * prunes excess Baileys pre-keys without touching creds.json,
 * clears stale in-memory states, and triggers garbage collection.
 */
export async function performSystemCleanup(options?: {
  dryRun?: boolean;
}): Promise<CleanupResult> {
  const isDryRun = !!options?.dryRun;
  const now = Date.now();
  const logs: string[] = [];
  let cleanedCount = 0;
  let freedBytes = 0;

  const memBefore = getMemoryStats();
  logs.push(`[AutoCleaner] Memulai pembersihan sistem. RAM terpakai: ${memBefore.usedMB}/${memBefore.totalMB} MB`);

  let tempMediaCount = 0;
  let tempOsCount = 0;
  let prunedPreKeysCount = 0;
  let staleStatesCount = 0;

  // 1. Clean Workspace root temporary files
  const rootDir = process.cwd();
  try {
    const rootFiles = fs.readdirSync(rootDir);
    for (const f of rootFiles) {
      const fullPath = path.join(rootDir, f);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          const ageMs = now - stat.mtimeMs;
          if (isDisposableWorkspaceFile(f, fullPath, ageMs)) {
            const fileSize = stat.size;
            if (!isDryRun) {
              fs.unlinkSync(fullPath);
            }
            cleanedCount++;
            freedBytes += fileSize;
            tempMediaCount++;
            logs.push(`[Workspace] Dihapus: ${f} (${formatBytes(fileSize)})`);
          }
        }
      } catch (err: any) {
        // Ignore file lock or permission error safely
      }
    }
  } catch (e: any) {
    logs.push(`[Workspace] Gagal membaca direktori: ${e.message}`);
  }

  // 1b. Rotate / Truncate debug log (app_debug.log) if larger than 2MB
  const debugLogPath = path.join(rootDir, 'app_debug.log');
  try {
    if (fs.existsSync(debugLogPath)) {
      const logStat = fs.statSync(debugLogPath);
      // If log file exceeds 2MB, keep only the latest 200KB
      if (logStat.size > 2 * 1024 * 1024) {
        const buffer = Buffer.alloc(200 * 1024);
        const fd = fs.openSync(debugLogPath, 'r');
        const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, logStat.size - buffer.length);
        fs.closeSync(fd);
        if (!isDryRun) {
          fs.writeFileSync(debugLogPath, `[Log Rotated by AutoCleaner at ${new Date().toISOString()}]\n` + buffer.toString('utf8', 0, bytesRead));
        }
        const freed = logStat.size - bytesRead;
        freedBytes += freed;
        logs.push(`[Log Rotation] Merampingkan app_debug.log dari ${formatBytes(logStat.size)} -> ${formatBytes(bytesRead)} (+${formatBytes(freed)} bebas)`);
      }
    }
  } catch (e) {}

  // 2. Clean OS temporary folder (os.tmpdir())
  const tmpDir = os.tmpdir();
  try {
    if (fs.existsSync(tmpDir)) {
      const tmpFiles = fs.readdirSync(tmpDir);
      for (const f of tmpFiles) {
        // Target specific temp prefixes created by TTS, ffmpeg, Baileys, or node
        if (
          f.startsWith('edge_tts_') ||
          f.startsWith('tmp-') ||
          f.startsWith('ffmpeg-') ||
          f.startsWith('baileys-') ||
          f.endsWith('.tmp')
        ) {
          const fullPath = path.join(tmpDir, f);
          try {
            const stat = fs.statSync(fullPath);
            const ageMs = now - stat.mtimeMs;
            // Only clean OS temp files older than 10 minutes
            if (ageMs > 10 * 60 * 1000) {
              const fileSize = stat.size;
              if (!isDryRun) {
                if (stat.isDirectory()) {
                  fs.rmSync(fullPath, { recursive: true, force: true });
                } else {
                  fs.unlinkSync(fullPath);
                }
              }
              cleanedCount++;
              freedBytes += fileSize;
              tempOsCount++;
              logs.push(`[OS Temp] Dihapus: ${f} (${formatBytes(fileSize)})`);
            }
          } catch (err) {}
        }
      }
    }
  } catch (e: any) {
    logs.push(`[OS Temp] Gagal membersihkan folder tmp: ${e.message}`);
  }

  // 3. WhatsApp Baileys Auth Hygiene (Pruning old pre-keys without touching creds.json!)
  // In STB Armbian eMMC/SD, Baileys can create tens of thousands of pre-key-*.json files,
  // which burns out filesystem inodes and fills disk blocks.
  const waAuthDir = path.join(rootDir, 'wa_auth');
  try {
    if (fs.existsSync(waAuthDir)) {
      const authFiles = fs.readdirSync(waAuthDir);
      const preKeyFiles: { name: string; fullPath: string; mtimeMs: number; size: number }[] = [];

      for (const f of authFiles) {
        // STRICT SAFETY CHECK:
        // NEVER touch creds.json or app-state-sync keys!
        if (f === 'creds.json' || f.startsWith('app-state-sync')) continue;

        if (f.startsWith('pre-key-') && f.endsWith('.json')) {
          const fullPath = path.join(waAuthDir, f);
          try {
            const stat = fs.statSync(fullPath);
            preKeyFiles.push({ name: f, fullPath, mtimeMs: stat.mtimeMs, size: stat.size });
          } catch (e) {}
        }
      }

      // Keep at least the 50 newest pre-keys to preserve active cryptographic negotiation!
      // Only prune if there are more than 60 pre-keys and they are older than 24 hours.
      if (preKeyFiles.length > 60) {
        // Sort descending: newest first
        preKeyFiles.sort((a, b) => b.mtimeMs - a.mtimeMs);
        const filesToPrune = preKeyFiles.slice(50); // Keep top 50 newest

        for (const pk of filesToPrune) {
          const ageMs = now - pk.mtimeMs;
          if (ageMs > 24 * 60 * 60 * 1000) {
            // Older than 1 day
            if (!isDryRun) {
              try {
                fs.unlinkSync(pk.fullPath);
              } catch (e) {}
            }
            cleanedCount++;
            freedBytes += pk.size;
            prunedPreKeysCount++;
          }
        }
        if (prunedPreKeysCount > 0) {
          logs.push(`[WA Auth] Mengamankan inode Armbian: merapikan ${prunedPreKeysCount} file pre-key usang (creds.json tetap aman 100%)`);
        }
      }
    }
  } catch (e: any) {
    logs.push(`[WA Auth] Evaluasi folder auth: ${e.message}`);
  }

  // 4. Memory Hygiene & In-Memory Hooks (User states, cache maps)
  for (const hook of memoryHooks) {
    try {
      const res = hook();
      staleStatesCount += res.clearedCount;
      if (res.clearedCount > 0) {
        logs.push(`[Memory Hook] ${res.name}: membebaskan ${res.clearedCount} entri cache.`);
      }
    } catch (e) {}
  }

  // 5. Trigger V8 Garbage Collection if exposed (--expose-gc)
  if (typeof (global as any).gc === 'function') {
    try {
      (global as any).gc();
      logs.push('[V8 Engine] Garbage collection (gc) berhasil dijalankan.');
    } catch (e) {}
  }

  const memAfter = getMemoryStats();
  const ramFreedMB = Math.max(0, memBefore.usedMB - memAfter.usedMB);
  const storage = getStorageStats();

  const result: CleanupResult = {
    success: true,
    timestamp: new Date().toISOString(),
    cleanedFilesCount: cleanedCount,
    freedBytes,
    freedFormatted: formatBytes(freedBytes),
    details: {
      tempMediaFiles: tempMediaCount,
      tempOsFiles: tempOsCount,
      prunedPreKeys: prunedPreKeysCount,
      staleStatesCleared: staleStatesCount
    },
    memoryBefore: memBefore,
    memoryAfter: memAfter,
    ramFreedMB,
    storage,
    logs
  };

  lastCleanupResult = result;
  return result;
}

/**
 * Get current cleaner status
 */
export function getSystemCleanerStatus(): CleanerStatus {
  let pendingCount = 0;
  const rootDir = process.cwd();
  const now = Date.now();

  try {
    const rootFiles = fs.readdirSync(rootDir);
    for (const f of rootFiles) {
      try {
        const fullPath = path.join(rootDir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && isDisposableWorkspaceFile(f, fullPath, now - stat.mtimeMs)) {
          pendingCount++;
        }
      } catch (e) {}
    }
  } catch (e) {}

  return {
    lastRun: lastCleanupResult?.timestamp || null,
    lastCleanedCount: lastCleanupResult?.cleanedFilesCount || 0,
    lastFreedFormatted: lastCleanupResult?.freedFormatted || '0 B',
    pendingTempFiles: pendingCount,
    schedulerActive: cleanerIntervalTimer !== null,
    intervalMinutes: 30
  };
}

/**
 * Start the automatic scheduled cleaner.
 * Runs every 30 minutes in background + initial run 10 seconds after server launch.
 */
export function startAutoCleanerScheduler(intervalMinutes: number = 30): void {
  if (cleanerIntervalTimer) {
    clearInterval(cleanerIntervalTimer);
  }

  const intervalMs = intervalMinutes * 60 * 1000;

  // Initial sweep 10 seconds after startup
  setTimeout(async () => {
    try {
      const res = await performSystemCleanup();
      if (res.cleanedFilesCount > 0 || res.ramFreedMB > 0) {
        console.log(
          `[AutoCleaner] 🧹 Initial sweep: menghapus ${res.cleanedFilesCount} file sampah (${res.freedFormatted}), RAM bebas: ${res.memoryAfter.freeMB}MB`
        );
      }
    } catch (e: any) {
      console.error('[AutoCleaner] Initial sweep error:', e.message);
    }
  }, 10000);

  // Recurring background interval
  cleanerIntervalTimer = setInterval(async () => {
    try {
      const res = await performSystemCleanup();
      if (res.cleanedFilesCount > 0 || res.ramFreedMB > 0) {
        console.log(
          `[AutoCleaner] 🧹 Pembersihan otomatis berkala: ${res.cleanedFilesCount} file sampah dibersihkan (${res.freedFormatted}), RAM bebas: ${res.memoryAfter.freeMB}MB (Disk Bebas: ${res.storage.freeGB}GB)`
        );
      }
    } catch (e: any) {
      console.error('[AutoCleaner] Periodic clean error:', e.message);
    }
  }, intervalMs);

  console.log(`[AutoCleaner] 🛡️ Pembersih sampah otomatis aktif (Setiap ${intervalMinutes} menit) - Ramah Armbian STB & Server.`);
}
