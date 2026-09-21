import Holidays from 'date-holidays';

export interface HolidayEntry {
  name: string;
  year: number;
  month: number; // 1-12
  date: number; // 1-31
  isOfficialPublicHoliday?: boolean;
}

// 1. Hari Libur Nasional Resmi (SKB 3 Menteri) untuk 2025 dan 2026
const officialHolidaysSKB: HolidayEntry[] = [
  // Tahun 2025
  { year: 2025, month: 1, date: 1, name: 'Tahun Baru 2025 Masehi', isOfficialPublicHoliday: true },
  { year: 2025, month: 1, date: 27, name: "Isra Mikraj Nabi Muhammad SAW", isOfficialPublicHoliday: true },
  { year: 2025, month: 1, date: 29, name: 'Tahun Baru Imlek 2576 Kongzili', isOfficialPublicHoliday: true },
  { year: 2025, month: 3, date: 29, name: 'Hari Suci Nyepi (Tahun Baru Saka 1947)', isOfficialPublicHoliday: true },
  { year: 2025, month: 3, date: 31, name: 'Hari Raya Idulfitri 1446 Hijriah', isOfficialPublicHoliday: true },
  { year: 2025, month: 4, date: 1, name: 'Hari Raya Idulfitri 1446 Hijriah', isOfficialPublicHoliday: true },
  { year: 2025, month: 4, date: 18, name: 'Wafat Yesus Kristus', isOfficialPublicHoliday: true },
  { year: 2025, month: 4, date: 20, name: 'Kebangkitan Yesus Kristus (Paskah)', isOfficialPublicHoliday: true },
  { year: 2025, month: 5, date: 1, name: 'Hari Buruh Internasional', isOfficialPublicHoliday: true },
  { year: 2025, month: 5, date: 12, name: 'Hari Raya Waisak 2569 BE', isOfficialPublicHoliday: true },
  { year: 2025, month: 5, date: 29, name: 'Kenaikan Yesus Kristus', isOfficialPublicHoliday: true },
  { year: 2025, month: 6, date: 1, name: 'Hari Lahir Pancasila', isOfficialPublicHoliday: true },
  { year: 2025, month: 6, date: 6, name: 'Hari Raya Iduladha 1446 Hijriah', isOfficialPublicHoliday: true },
  { year: 2025, month: 6, date: 27, name: 'Tahun Baru Islam 1447 Hijriah (1 Muharram)', isOfficialPublicHoliday: true },
  { year: 2025, month: 8, date: 17, name: 'Proklamasi Kemerdekaan RI (HUT RI)', isOfficialPublicHoliday: true },
  { year: 2025, month: 9, date: 5, name: 'Maulid Nabi Muhammad SAW', isOfficialPublicHoliday: true },
  { year: 2025, month: 12, date: 25, name: 'Hari Raya Natal', isOfficialPublicHoliday: true },

  // Tahun 2026
  { year: 2026, month: 1, date: 1, name: 'Tahun Baru 2026 Masehi', isOfficialPublicHoliday: true },
  { year: 2026, month: 1, date: 16, name: "Isra Mikraj Nabi Muhammad SAW", isOfficialPublicHoliday: true },
  { year: 2026, month: 2, date: 17, name: 'Tahun Baru Imlek 2577 Kongzili', isOfficialPublicHoliday: true },
  { year: 2026, month: 3, date: 19, name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', isOfficialPublicHoliday: true },
  { year: 2026, month: 3, date: 21, name: 'Hari Raya Idulfitri 1447 Hijriah', isOfficialPublicHoliday: true },
  { year: 2026, month: 3, date: 22, name: 'Hari Raya Idulfitri 1447 Hijriah', isOfficialPublicHoliday: true },
  { year: 2026, month: 4, date: 3, name: 'Wafat Yesus Kristus', isOfficialPublicHoliday: true },
  { year: 2026, month: 4, date: 5, name: 'Kebangkitan Yesus Kristus (Paskah)', isOfficialPublicHoliday: true },
  { year: 2026, month: 5, date: 1, name: 'Hari Buruh Internasional', isOfficialPublicHoliday: true },
  { year: 2026, month: 5, date: 14, name: 'Kenaikan Yesus Kristus', isOfficialPublicHoliday: true },
  { year: 2026, month: 5, date: 27, name: 'Hari Raya Iduladha 1447 Hijriah', isOfficialPublicHoliday: true },
  { year: 2026, month: 5, date: 31, name: 'Hari Raya Waisak 2570 BE', isOfficialPublicHoliday: true },
  { year: 2026, month: 6, date: 1, name: 'Hari Lahir Pancasila', isOfficialPublicHoliday: true },
  { year: 2026, month: 6, date: 16, name: 'Tahun Baru Islam 1448 Hijriah (1 Muharram)', isOfficialPublicHoliday: true },
  { year: 2026, month: 8, date: 17, name: 'Proklamasi Kemerdekaan RI (HUT RI)', isOfficialPublicHoliday: true },
  { year: 2026, month: 8, date: 25, name: 'Maulid Nabi Muhammad SAW', isOfficialPublicHoliday: true },
  { year: 2026, month: 12, date: 25, name: 'Hari Raya Natal', isOfficialPublicHoliday: true },
];

// 2. Hari Peringatan / Hari Besar Nasional Indonesia (Tanggal tetap setiap tahun)
const nationalObservances = [
  { month: 1, date: 25, name: 'Hari Gizi Nasional' },
  { month: 2, date: 9, name: 'Hari Pers Nasional' },
  { month: 2, date: 21, name: 'Hari Peduli Sampah Nasional' },
  { month: 3, date: 9, name: 'Hari Musik Nasional' },
  { month: 3, date: 30, name: 'Hari Film Nasional' },
  { month: 4, date: 21, name: 'Hari Kartini' },
  { month: 5, date: 2, name: 'Hari Pendidikan Nasional (Hardiknas)' },
  { month: 5, date: 20, name: 'Hari Kebangkitan Nasional (Harkitnas)' },
  { month: 5, date: 29, name: 'Hari Lanjut Usia Nasional' },
  { month: 6, date: 24, name: 'Hari Bidan Nasional' },
  { month: 7, date: 1, name: 'Hari Bhayangkara (POLRI)' },
  { month: 7, date: 22, name: 'Hari Kejaksaan RI' },
  { month: 7, date: 23, name: 'Hari Anak Nasional' },
  { month: 8, date: 10, name: 'Hari Veteran Nasional' },
  { month: 8, date: 14, name: 'Hari Pramuka' },
  { month: 9, date: 9, name: 'Hari Olahraga Nasional (Haornas)' },
  { month: 9, date: 24, name: 'Hari Tani Nasional' },
  { month: 10, date: 1, name: 'Hari Kesaktian Pancasila' },
  { month: 10, date: 2, name: 'Hari Batik Nasional' },
  { month: 10, date: 5, name: 'Hari TNI (Tentara Nasional Indonesia)' },
  { month: 10, date: 22, name: 'Hari Santri Nasional' },
  { month: 10, date: 28, name: 'Hari Sumpah Pemuda' },
  { month: 11, date: 10, name: 'Hari Pahlawan' },
  { month: 11, date: 12, name: 'Hari Ayah Nasional & Hari Kesehatan Nasional' },
  { month: 11, date: 25, name: 'Hari Guru Nasional (PGRI)' },
  { month: 11, date: 29, name: 'Hari KORPRI' },
  { month: 12, date: 13, name: 'Hari Nusantara' },
  { month: 12, date: 19, name: 'Hari Bela Negara' },
  { month: 12, date: 22, name: 'Hari Ibu' },
];

/**
 * Mendapatkan seluruh daftar hari libur & hari besar nasional untuk tahun tertentu
 */
export function getAllHolidaysForYear(year: number): HolidayEntry[] {
  const result: HolidayEntry[] = [];
  const registeredKey = new Set<string>();

  const addEntry = (entry: HolidayEntry) => {
    const key = `${entry.year}-${entry.month}-${entry.date}`;
    // Jika sudah ada hari libur nasional resmi pada tanggal tersebut, beri prioritas hari libur nasional
    if (!registeredKey.has(key)) {
      registeredKey.add(key);
      result.push(entry);
    }
  };

  // 1. Masukkan hari libur resmi SKB jika tahun terdaftar
  const skbForYear = officialHolidaysSKB.filter(h => h.year === year);
  if (skbForYear.length > 0) {
    skbForYear.forEach(addEntry);
  } else {
    // Fallback menggunakan date-holidays dengan perbaikan bug
    try {
      const hd = new Holidays('ID');
      const holidays = hd.getHolidays(year);
      holidays.forEach(h => {
        const d = new Date(h.date);
        let holidayName = h.name;

        // Perbaiki bug 27 Rajab yang salah dinamai Maulid oleh library
        if (h.rule && (h.rule.includes('27 Rajab') || (holidayName.toLowerCase().includes('maulid') && d.getMonth() <= 2))) {
          holidayName = "Isra Mikraj Nabi Muhammad SAW";
        }
        if (holidayName.toLowerCase().includes('tahun baru') && !holidayName.toLowerCase().includes('imlek') && !holidayName.toLowerCase().includes('islam')) {
          holidayName = `Tahun Baru ${year} Masehi`;
        }
        if (holidayName.toLowerCase().includes('ulang tahun kemerdekaan')) {
          holidayName = 'Proklamasi Kemerdekaan RI (HUT RI)';
        }

        addEntry({
          year,
          month: d.getMonth() + 1,
          date: d.getDate(),
          name: holidayName,
          isOfficialPublicHoliday: h.type === 'public'
        });
      });
    } catch (e) {
      console.error('Error loading fallback date-holidays:', e);
    }
  }

  // 2. Masukkan hari peringatan nasional tahunan
  nationalObservances.forEach(obs => {
    addEntry({
      year,
      month: obs.month,
      date: obs.date,
      name: obs.name,
      isOfficialPublicHoliday: false
    });
  });

  return result.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.date - b.date;
  });
}

/**
 * Normalisasi objek Date ke zona waktu WITA (Asia/Makassar, UTC+8)
 */
export function getWitaDateComponents(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  }).formatToParts(date);

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  parts.forEach(p => {
    if (p.type === 'year') year = parseInt(p.value, 10);
    if (p.type === 'month') month = parseInt(p.value, 10);
    if (p.type === 'day') day = parseInt(p.value, 10);
  });

  return { year, month, day };
}

/**
 * Dapatkan info hari libur/hari besar hari ini atau hari libur terdekat berikutnya
 */
export const getHolidayInfo = (currentDate: Date = new Date()) => {
  const { year: curYear, month: curMonth, day: curDate } = getWitaDateComponents(currentDate);

  // Ambil data untuk tahun sekarang dan tahun depan
  const holidays = [
    ...getAllHolidaysForYear(curYear),
    ...getAllHolidaysForYear(curYear + 1)
  ];

  // Cari hari besar / libur hari ini
  const todayHoliday = holidays.find(h => h.year === curYear && h.month === curMonth && h.date === curDate);
  if (todayHoliday) {
    return {
      text: todayHoliday.name,
      name: todayHoliday.name,
      isToday: true,
      isOfficialPublicHoliday: Boolean(todayHoliday.isOfficialPublicHoliday)
    };
  }

  // Cari hari besar / libur terdekat yang akan datang
  const currentTotalDays = curYear * 372 + (curMonth - 1) * 31 + curDate;
  const upcoming = holidays
    .filter(h => {
      const hTotalDays = h.year * 372 + (h.month - 1) * 31 + h.date;
      return hTotalDays > currentTotalDays;
    })
    .sort((a, b) => {
      const aTotal = a.year * 372 + (a.month - 1) * 31 + a.date;
      const bTotal = b.year * 372 + (b.month - 1) * 31 + b.date;
      return aTotal - bTotal;
    });

  if (upcoming.length > 0) {
    const next = upcoming[0];
    
    // Hitung selisih hari dengan Date object tepat
    const dNow = new Date(curYear, curMonth - 1, curDate);
    const dNext = new Date(next.year, next.month - 1, next.date);
    const diffTime = dNext.getTime() - dNow.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 3600 * 24)));

    return {
      text: `${next.name} (${diffDays} hari lagi)`,
      name: next.name,
      diffDays,
      isToday: false,
      isOfficialPublicHoliday: Boolean(next.isOfficialPublicHoliday)
    };
  }

  return null;
};

/**
 * Format string tanggal lengkap beserta informasi hari nasional
 */
export function getCalendarInfo(date: Date = new Date()): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const { year, month, day } = getWitaDateComponents(date);
  const witaDate = new Date(year, month - 1, day);
  const dayName = days[witaDate.getDay()];
  const dateNum = day.toString().padStart(2, '0');
  const monthName = months[month - 1];
  const fullDateStr = `${dayName}, ${dateNum} ${monthName} ${year}`;

  const holiday = getHolidayInfo(date);
  if (holiday) {
    if (holiday.isToday) {
      return `${fullDateStr} - ${holiday.name} (Hari Ini)`;
    } else {
      return `${fullDateStr} - Menuju ${holiday.text}`;
    }
  }

  return fullDateStr;
}
