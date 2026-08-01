const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  // Basic rate limiting to prevent brute force & bot attacks
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
  app.use("/api/", apiLimiter);`;

const replacementStr = `  // Basic rate limiting to prevent brute force & bot attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: { success: false, error: "Terlalu banyak request dari IP ini, coba lagi nanti. (Anti-Bot Protection)" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Bebaskan webhook dari rate limit agar notifikasi dari Digiflazz tidak terblokir
      return req.path.includes('/webhook') || req.path.includes('/api/digiflazz-webhook');
    }
  });
  app.use(limiter);
  
  // Specific stricter rate limit for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, 
    message: { success: false, error: "Limit request API tercapai. (Anti-DDoS Protection)" },
    skip: (req) => {
      // Bebaskan webhook dari rate limit
      return req.path.includes('/webhook') || req.path.includes('/api/digiflazz-webhook');
    }
  });
  app.use("/api/", apiLimiter);`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
