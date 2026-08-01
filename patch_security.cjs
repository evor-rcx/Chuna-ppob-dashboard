const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importExpress = 'import express from "express";';
const importSecurity = `import express from "express";\nimport helmet from "helmet";\nimport rateLimit from "express-rate-limit";`;

code = code.replace(importExpress, importSecurity);

const setupApp = `const app = express();
  app.get("/api/dump"`;

const setupSecurity = `const app = express();

  // Cyber Security Measures (Anti-hacker, Anti-bot)
  app.use(helmet({
    contentSecurityPolicy: false, // disabled for some react apps if it breaks inline scripts, adjust if needed
    crossOriginEmbedderPolicy: false
  }));
  
  // Basic rate limiting to prevent brute force & bot attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: { success: false, error: "Terlalu banyak request dari IP ini, coba lagi nanti. (Anti-Bot Protection)" },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
  
  // Specific stricter rate limit for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, 
    message: { success: false, error: "Limit request API tercapai. (Anti-DDoS Protection)" }
  });
  app.use("/api/", apiLimiter);

  app.get("/api/dump"`;

code = code.replace(setupApp, setupSecurity);
fs.writeFileSync('server.ts', code);
