let audioCtx: AudioContext | null = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playAccessGranted() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Sci-fi techy chord
    playNote(523.25, now, 0.4); // C5
    playNote(659.25, now + 0.1, 0.4); // E5
    playNote(783.99, now + 0.2, 0.6); // G5
    playNote(1046.50, now + 0.3, 1.2, 'triangle'); // C6
  } catch (e) {
    console.log("Audio play failed", e);
  }
}

export function playTerminalBlip() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    // Random high pitch for tech feeling
    osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.log("Audio play failed", e);
  }
}

export function playPowerDown() {
    try {
        const ctx = getContext();
        if (ctx.state === 'suspended') ctx.resume();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.5);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
    } catch(e) {}
}

/**
 * Memutar nada notifikasi chime 2-nada lembut yang ramah untuk pesan masuk
 */
export function playNotificationChime() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const playChimeTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Nada D5 (587Hz) dilanjutkan A5 (880Hz) yang jernih dan manis
    playChimeTone(587.33, now, 0.35);
    playChimeTone(880.00, now + 0.12, 0.65);
  } catch (e) {
    console.log("Notification chime failed", e);
  }
}

let currentNotificationAudio: HTMLAudioElement | null = null;

/**
 * Membacakan notifikasi pesan masuk WhatsApp menggunakan Suara Voice Note asli bot (id-ID-GadisNeural / Chuna)
 * Format: "Ada pesan masuk dari [Nama Pengirim], pesannya adalah: [Isi Pesan]"
 */
export async function speakWaNotification(
  senderName: string, 
  messageText: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  const cleanSender = (senderName || 'Pelanggan').trim();
  const cleanMsg = (messageText || '').trim();
  const spokenText = `Ada pesan masuk dari ${cleanSender}, pesannya adalah: ${cleanMsg}`;

  // Hentikan audio notifikasi sebelumnya jika masih berputar agar tidak bertumpuk
  if (currentNotificationAudio) {
    try {
      currentNotificationAudio.pause();
      currentNotificationAudio.currentTime = 0;
    } catch (e) {}
    currentNotificationAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Jeda 280ms agar nada chime berbunyi lembut terlebih dahulu sebelum suara berbicara
  await new Promise(r => setTimeout(r, 280));

  try {
    // 1. Ambil audio suara Voice Note resmi bot (/api/wa/tts-preview) yang memakai id-ID-GadisNeural
    const res = await fetch('/api/wa/tts-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: spokenText })
    });

    if (res.ok) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentNotificationAudio = audio;

      return new Promise<void>((resolve) => {
        audio.onplay = () => {
          onStart?.();
        };
        audio.onended = () => {
          currentNotificationAudio = null;
          URL.revokeObjectURL(audioUrl);
          onEnd?.();
          resolve();
        };
        audio.onerror = (e) => {
          console.warn('Voice note audio playback error:', e);
          currentNotificationAudio = null;
          URL.revokeObjectURL(audioUrl);
          onEnd?.();
          resolve();
        };
        audio.play().catch(err => {
          console.warn('Voice note playback prevented or interrupted:', err);
          currentNotificationAudio = null;
          URL.revokeObjectURL(audioUrl);
          onEnd?.();
          resolve();
        });
      });
    }
  } catch (err) {
    console.warn('Gagal memuat suara Voice Note bot dari server, menggunakan fallback browser:', err);
  }

  // Fallback darurat jika koneksi server terganggu: Web Speech API browser
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return new Promise<void>((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        utterance.pitch = 1.05;

        const voices = window.speechSynthesis.getVoices();
        const indonesianVoice = voices.find(v => 
          v.lang.toLowerCase().includes('id') || 
          v.lang.toLowerCase().includes('in') || 
          v.name.toLowerCase().includes('indonesia')
        );
        if (indonesianVoice) utterance.voice = indonesianVoice;

        utterance.onstart = () => onStart?.();
        utterance.onend = () => {
          onEnd?.();
          resolve();
        };
        utterance.onerror = () => {
          onEnd?.();
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        onEnd?.();
        resolve();
      }
    });
  } else {
    onEnd?.();
  }
}
