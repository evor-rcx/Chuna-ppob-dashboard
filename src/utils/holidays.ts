import Holidays from 'date-holidays';

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

