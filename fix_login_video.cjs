const fs = require('fs');
let login = fs.readFileSync('src/components/views/Login.tsx', 'utf8');

login = login.replace(
    'const Login = ({ onLogin }: LoginProps) => {',
    'const Login = ({ onLogin }: LoginProps) => {\n  const [videoError, setVideoError] = useState(false);'
);

login = login.replace(
    '{/* Video logo */}\n                <video autoPlay loop muted playsInline className="w-full h-full object-contain">\n                  <source src="/logo.mp4" type="video/mp4" />\n                </video>',
    `{videoError ? (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Store className="w-10 h-10 text-white" />
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

// We need to make sure Store is imported in Login.tsx
if (!login.includes('import { Store }')) {
    login = login.replace(
        'import { LogIn, Key, Loader2, AlertCircle } from "lucide-react";',
        'import { LogIn, Key, Loader2, AlertCircle, Store } from "lucide-react";'
    );
}

fs.writeFileSync('src/components/views/Login.tsx', login);
