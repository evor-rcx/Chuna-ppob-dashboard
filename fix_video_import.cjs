const fs = require('fs');

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
if (!sidebar.includes("import logoVideo")) {
    sidebar = sidebar.replace("import { Store } from \"lucide-react\";", "import { Store } from \"lucide-react\";\nimport logoVideo from '../logo.mp4';");
}
sidebar = sidebar.replace(
    '<video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" onError={(e) => console.error("Video error:", e)} />',
    '<video src={logoVideo} autoPlay loop muted playsInline className="w-full h-full object-contain" />'
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let login = fs.readFileSync('src/components/views/Login.tsx', 'utf8');
if (!login.includes("import logoVideo")) {
    login = login.replace("import { LogIn, Key, Loader2, AlertCircle } from \"lucide-react\";", "import { LogIn, Key, Loader2, AlertCircle } from \"lucide-react\";\nimport logoVideo from '../../logo.mp4';");
}
login = login.replace(
    '<video src="/logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain" onError={(e) => console.error("Video error:", e)} />',
    '<video src={logoVideo} autoPlay loop muted playsInline className="w-full h-full object-contain" />'
);
fs.writeFileSync('src/components/views/Login.tsx', login);
