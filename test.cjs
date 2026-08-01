const http = require('http');
http.get('http://localhost:3000/api/members', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("ONLINE:", data));
});
http.get('http://localhost:3000/api/members/offline', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("OFFLINE:", data));
});
