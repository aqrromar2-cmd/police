const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const VIDEOS_SYNC_DIR = 'C:\\Users\\Admin\\Videos\\police Departments';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/save-html') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.html) {
          const indexPath = path.join(PUBLIC_DIR, 'index.html');
          fs.writeFileSync(indexPath, data.html, 'utf8');

          // Sync to Videos directory if it exists
          if (fs.existsSync(VIDEOS_SYNC_DIR)) {
            try {
              fs.writeFileSync(path.join(VIDEOS_SYNC_DIR, 'index.html'), data.html, 'utf8');
            } catch(e) {}
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'تم تحديث الملفات على الجهاز بنجاح بدون تنزيل ملفات مكررة' }));
          return;
        }
      } catch (err) {
        console.error(err);
      }
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false }));
    });
    return;
  }

  // Serve static files for preview if opened via http://localhost:3000
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      let ext = path.extname(filePath);
      let contentType = 'text/html; charset=utf-8';
      if (ext === '.js') contentType = 'text/javascript; charset=utf-8';
      if (ext === '.css') contentType = 'text/css; charset=utf-8';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.json') contentType = 'application/json';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ سيرفر المزامنة والتعديل المباشر شغال على: http://localhost:${PORT}`);
});
