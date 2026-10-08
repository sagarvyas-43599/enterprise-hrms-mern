const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    const token = data.data.accessToken;
    console.log('Token received');
    
    const req2 = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/expenses',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        console.log('Status:', res2.statusCode);
        console.log('Response:', body2);
      });
    });
    
    req2.write(JSON.stringify({
      title: "Test",
      description: "Test description",
      category: "TRAVEL",
      amount: 12,
      currency: "USD",
      dateIncurred: "2026-10-05"
    }));
    req2.end();
  });
});

req.write(JSON.stringify({ email: "admin@hrms.com", password: "Admin@123" }));
req.end();
