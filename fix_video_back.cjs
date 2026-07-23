const fs = require('fs');

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
    /\{videoError \? \([\s\S]*?<\/video>\n            \)\}/,
    '<video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" onError={(e) => console.error("Video error:", e)} />'
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let login = fs.readFileSync('src/components/views/Login.tsx', 'utf8');
login = login.replace(
    /\{videoError \? \([\s\S]*?<\/video>\n                \)\}/,
    '<video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" onError={(e) => console.error("Video error:", e)} />'
);
fs.writeFileSync('src/components/views/Login.tsx', login);

