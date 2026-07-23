export const getHolidayInfo = (currentDate: Date) => {
  const allHolidays = [
    { month: 0, date: 1, name: 'Tahun Baru Masehi' },
    { month: 1, date: 17, name: 'Isra Mikraj', year: 2026 },
    { month: 2, date: 3, name: 'Hari Raya Nyepi', year: 2026 },
    { month: 2, date: 20, name: 'Awal Puasa Ramadan', year: 2026 },
    { month: 3, date: 2, name: 'Jumat Agung', year: 2026 },
    { month: 3, date: 18, name: 'Hari Raya Idul Fitri', year: 2026 },
    { month: 3, date: 19, name: 'Hari Raya Idul Fitri', year: 2026 },
    { month: 4, date: 1, name: 'Hari Buruh Internasional' },
    { month: 4, date: 14, name: 'Kenaikan Yesus Kristus', year: 2026 },
    { month: 4, date: 31, name: 'Hari Raya Waisak', year: 2026 },
    { month: 5, date: 1, name: 'Hari Lahir Pancasila' },
    { month: 5, date: 26, name: 'Hari Raya Idul Adha', year: 2026 },
    { month: 6, date: 14, name: 'Tahun Baru Islam', year: 2026 }, // Jul 14, 2026
    { month: 7, date: 17, name: 'Hari Kemerdekaan RI' },
    { month: 8, date: 24, name: 'Maulid Nabi Muhammad SAW', year: 2026 }, // Sept 24, 2026
    { month: 9, date: 1, name: 'Hari Kesaktian Pancasila' },
    { month: 9, date: 28, name: 'Hari Sumpah Pemuda' },
    { month: 10, date: 10, name: 'Hari Pahlawan' },
    { month: 10, date: 25, name: 'Hari Guru Nasional' },
    { month: 11, date: 22, name: 'Hari Ibu' },
    { month: 11, date: 25, name: 'Hari Raya Natal' },
  ];

  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  const currentYear = currentDate.getFullYear();
  
  // Find today's holiday
  const todayHoliday = allHolidays.find(h => h.month === currentMonth && h.date === currentDay && (!h.year || h.year === currentYear));
  
  if (todayHoliday) {
    return { text: todayHoliday.name, isToday: true };
  }
  
  // Find next holiday
  const upcomingHolidays = allHolidays
    .filter(h => (!h.year || h.year >= currentYear))
    .map(h => ({
      ...h,
      parsedDate: new Date(h.year || currentYear, h.month, h.date)
    }))
    .filter(h => h.parsedDate.getTime() > currentDate.getTime())
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
  if (upcomingHolidays.length > 0) {
    const next = upcomingHolidays[0];
    const curr = new Date(currentYear, currentMonth, currentDay);
    const diffDays = Math.ceil((next.parsedDate.getTime() - curr.getTime()) / (1000 * 3600 * 24));
    return { text: `${next.name} (${diffDays} hari lagi)`, isToday: false };
  }
  
  return null;
}
