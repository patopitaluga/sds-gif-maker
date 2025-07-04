import http from 'http';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = resolve(new URL('.', import.meta.url).pathname);

http.createServer((req, res) => {
  if (req.url === '/gif.worker.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end(readFileSync(resolve(__dirname, './gif.worker.js'), 'utf8'));
  }
  if (req.url === '/style.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(readFileSync(resolve(__dirname, './style.css'), 'utf8'));
  }
  if (req.url === '/')
    res.end(readFileSync(resolve(__dirname, './index.html'), 'utf8'));
})
  .listen(3000, () => console.log('Listening port 3000'));
