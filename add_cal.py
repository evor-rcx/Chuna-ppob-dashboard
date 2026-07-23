import re

with open("server.ts", "r") as f:
    content = f.read()

cal_func = """function getCalendarInfo(date: Date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    // We want the time in Makassar timezone to get the right day
    const witaStr = date.toLocaleString('en-US', { timeZone: 'Asia/Makassar' });
    const witaDate = new Date(witaStr);
    
    const dayName = days[witaDate.getDay()];
    
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
    
    let nextHoliday = null;
    let minDiff = Infinity;
    const currentYear = witaDate.getFullYear();
    
    for (const h of holidays) {
        let hDate = new Date(currentYear, h.month, h.date);
        if (hDate < witaDate && hDate.toDateString() !== witaDate.toDateString()) {
            hDate = new Date(currentYear + 1, h.month, h.date);
        }
        
        const todayStart = new Date(witaDate.getFullYear(), witaDate.getMonth(), witaDate.getDate());
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

"""

if "function getCalendarInfo" not in content:
    content = content.replace("async function generateCanvasReceipt", cal_func + "async function generateCanvasReceipt")

with open("server.ts", "w") as f:
    f.write(content)
