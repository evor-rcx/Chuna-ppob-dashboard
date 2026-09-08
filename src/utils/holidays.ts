import Holidays from 'date-holidays';

const customHolidays = [
  { month: 3, date: 21, name: 'Hari Kartini' },
  { month: 4, date: 2, name: 'Hari Pendidikan Nasional' },
  { month: 4, date: 20, name: 'Hari Kebangkitan Nasional' },
  { month: 9, date: 1, name: 'Hari Kesaktian Pancasila' },
  { month: 9, date: 2, name: 'Hari Batik Nasional' },
  { month: 9, date: 28, name: 'Hari Sumpah Pemuda' },
  { month: 10, date: 10, name: 'Hari Pahlawan' },
  { month: 11, date: 22, name: 'Hari Ibu' }
];

export const getHolidayInfo = (currentDate: Date) => {
  const hd = new Holidays('ID');
  const currentYear = currentDate.getFullYear();
  
  // Get holidays for current year and next year to ensure we have upcoming ones at the end of the year
  const holidaysThisYear = hd.getHolidays(currentYear);
  const holidaysNextYear = hd.getHolidays(currentYear + 1);
  
  const allHolidays = [...holidaysThisYear, ...holidaysNextYear].map(h => ({
    name: h.name,
    date: new Date(h.date),
    type: h.type
  }));

  // Inject custom national days
  [currentYear, currentYear + 1].forEach(year => {
    customHolidays.forEach(c => {
      allHolidays.push({
        name: c.name,
        date: new Date(year, c.month, c.date),
        type: 'custom'
      });
    });
  });

  // Find today's holiday
  const todayHoliday = allHolidays.find(h => {
    return h.date.getDate() === currentDate.getDate() && 
           h.date.getMonth() === currentDate.getMonth() && 
           h.date.getFullYear() === currentDate.getFullYear();
  });

  if (todayHoliday) {
    return { text: todayHoliday.name, isToday: true };
  }

  // Find next holiday
  const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  const upcomingHolidays = allHolidays
    .filter(h => h.date.getTime() > currentDateOnly.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
    
  if (upcomingHolidays.length > 0) {
    const next = upcomingHolidays[0];
    const diffDays = Math.ceil((next.date.getTime() - currentDateOnly.getTime()) / (1000 * 3600 * 24));
    return { text: `${next.name} (${diffDays} hari lagi)`, isToday: false };
  }
  
  return null;
}

