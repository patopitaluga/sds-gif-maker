import http from 'http';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = resolve(new URL('.', import.meta.url).pathname);

function pathnameOnly(reqUrl) {
  try {
    return new URL(reqUrl, 'http://localhost').pathname;
  } catch {
    return reqUrl.split('?')[0];
  }
}

const routes = {
  '/gif.js': { file: './gif.js', type: 'text/javascript; charset=utf-8' },
  '/gif.worker.js': { file: './gif.worker.js', type: 'text/javascript; charset=utf-8' },
  '/style.css': { file: './style.css', type: 'text/css; charset=utf-8' },
  '/camera2.mp3': { file: './camera2.mp3', type: 'audio/mpeg' },
};

http
  .createServer((req, res) => {
    const pathname = pathnameOnly(req.url || '/');

    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
      return;
    }

    const asset = routes[pathname];
    if (asset) {
      const body = readFileSync(resolve(__dirname, asset.file));
      res.writeHead(200, { 'Content-Type': asset.type });
      res.end(body);
      return;
    }

    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(readFileSync(resolve(__dirname, './index.html'), 'utf8'));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  })
  .listen(3000, () => console.log('Listening port 3000'));
