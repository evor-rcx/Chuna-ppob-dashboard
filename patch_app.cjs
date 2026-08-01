const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `import { Page } from './types';`;
const replacementStr = `import { Page } from './types';
import { getBgFile } from './lib/bgStore';`;

code = code.replace(targetStr, replacementStr);

const targetStr2 = `  const [bgType, setBgType] = useState(localStorage.getItem('chuna_bg_type') || '');
  const [bgUrl, setBgUrl] = useState(localStorage.getItem('chuna_bg_url') || '');

  useEffect(() => {
    const handleBgChange = () => {
      setBgType(localStorage.getItem('chuna_bg_type') || '');
      setBgUrl(localStorage.getItem('chuna_bg_url') || '');
    };
    window.addEventListener('chuna_bg_update', handleBgChange);
    return () => window.removeEventListener('chuna_bg_update', handleBgChange);
  }, []);`;

const replacementStr2 = `  const [bgType, setBgType] = useState(localStorage.getItem('chuna_bg_type') || '');
  const [bgUrl, setBgUrl] = useState('');

  useEffect(() => {
    let currentObjectUrl = '';
    const loadBg = async () => {
      const type = localStorage.getItem('chuna_bg_type') || '';
      setBgType(type);
      if (type) {
        try {
          const file = await getBgFile();
          if (file) {
            if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = URL.createObjectURL(file);
            setBgUrl(currentObjectUrl);
          } else {
            setBgUrl('');
          }
        } catch(e) {
          console.error("Failed to load bg file", e);
          setBgUrl('');
        }
      } else {
        setBgUrl('');
      }
    };
    loadBg();

    const handleBgChange = () => {
      loadBg();
    };
    window.addEventListener('chuna_bg_update', handleBgChange);
    return () => {
       window.removeEventListener('chuna_bg_update', handleBgChange);
       if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    };
  }, []);`;

code = code.replace(targetStr2, replacementStr2);
fs.writeFileSync('src/App.tsx', code);
