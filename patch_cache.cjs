const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `const app = express();
  const PORT = 3000;
  app.use(express.json());`;

const replacement = `const app = express();
  const PORT = 3000;
  app.use(express.json());
  
  // Disable caching for all API routes
  app.use('/api', (req, res, next) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
      next();
  });`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched cache headers!");
