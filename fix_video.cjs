const fs = require('fs');
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
    '<video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" />',
    '{/* Video logo */}\n            <video autoPlay loop muted playsInline className="w-full h-full object-contain">\n              <source src="/logo.mp4" type="video/mp4" />\n              Your browser does not support the video tag.\n            </video>'
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let login = fs.readFileSync('src/components/views/Login.tsx', 'utf8');
login = login.replace(
    '<video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" />',
    '{/* Video logo */}\n                <video autoPlay loop muted playsInline className="w-full h-full object-contain">\n                  <source src="/logo.mp4" type="video/mp4" />\n                </video>'
);
fs.writeFileSync('src/components/views/Login.tsx', login);
