const fs = require('fs');
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add state
sidebar = sidebar.replace(
    'const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {',
    'const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {\n  const [videoError, setVideoError] = useState(false);'
);

sidebar = sidebar.replace(
    '{/* Video logo */}\n            <video autoPlay loop muted playsInline className="w-full h-full object-contain">\n              <source src="/logo.mp4" type="video/mp4" />\n              Your browser does not support the video tag.\n            </video>',
    `{videoError ? (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Store className="w-8 h-8 text-white" />
              </div>
            ) : (
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-contain"
                onError={() => setVideoError(true)}
              >
                <source src="/logo.mp4" type="video/mp4" />
                <source src="./logo.mp4" type="video/mp4" />
              </video>
            )}`
);

fs.writeFileSync('src/components/Sidebar.tsx', sidebar);
