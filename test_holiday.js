function getCalendarInfo(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[date.getDay()];
    
    // Fixed holidays (month is 0-indexed)
    const holidays = [
        { month: 0, date: 1, name: 'Tahun Baru Masehi' },
        { month: 1, date: 14, name: 'Hari Valentine' },
        { month: 3, date: 21, name: 'Hari Kartini' },
        { month: 4, date: 1, name: 'Hari Buruh' },
        { month: 4, date: 2, name: 'Hari Pendidikan Nasional' },
        { month: 4, date: 20, name: 'Hari Kebangkitan Nasional' },
        { month: 5, date: 1, name: 'Hari Lahir Pancasila' },
        { month: 7, date: 17, name: 'Hari Kemerdekaan RI' },
        { month: 9, date: 1, name: 'Hari Kesaktian Pancasila' },
        { month: 9, date: 28, name: 'Hari Sumpah Pemuda' },
        { month: 10, date: 10, name: 'Hari Pahlawan' },
        { month: 11, date: 22, name: 'Hari Ibu' },
        { month: 11, date: 25, name: 'Hari Raya Natal' }
    ];
    
    // Find next holiday
    let nextHoliday = null;
    let minDiff = Infinity;
    
    const currentYear = date.getFullYear();
    
    for (const h of holidays) {
        let hDate = new Date(currentYear, h.month, h.date);
        // If the holiday has passed this year, look at next year
        if (hDate < date && hDate.toDateString() !== date.toDateString()) {
            hDate = new Date(currentYear + 1, h.month, h.date);
        }
        
        // Calculate difference in days, start of day to start of day
        const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const hStart = new Date(hDate.getFullYear(), hDate.getMonth(), hDate.getDate());
        const diffTime = Math.abs(hStart.getTime() - todayStart.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < minDiff) {
            minDiff = diffDays;
            nextHoliday = { ...h, daysLeft: diffDays };
        }
    }
    
    let eventText = '';
    if (nextHoliday) {
        if (nextHoliday.daysLeft === 0) {
            eventText = nextHoliday.name + ' (Hari Ini)';
        } else {
            eventText = nextHoliday.name + ' (' + nextHoliday.daysLeft + ' hari lagi)';
        }
    }
    
    return `${dayName}, ${eventText}`;
}

const d = new Date('2026-07-15T00:00:00');
console.log(getCalendarInfo(d));
