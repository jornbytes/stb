import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

function uploadPlugin(): Plugin {
  return {
    name: 'dev-upload',
    configureServer(server) {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const imgDir = path.join(__dirname, 'public', 'img');
      if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

      server.middlewares.use('/img', (req, res, next) => {
        const filePath = path.join(imgDir, req.url ?? '/');
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', lookupMime(filePath));
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });

      server.middlewares.use('/api/upload', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        if (req.method === 'DELETE') {
          const filename = path.basename(req.url?.replace(/^\//, '') ?? '');
          const filePath = path.join(imgDir, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end();
          return;
        }

        // Parse multipart/form-data manually using busboy
        const { default: busboy } = await import('busboy');
        const bb = busboy({ headers: req.headers });
        const uploaded: { filename: string; storage_path: string; public_url: string; mime_type: string; size: number }[] = [];

        bb.on('file', (fieldname, stream, info) => {
          const { filename, mimeType } = info;
          const ext = path.extname(filename);
          const storageName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
          const filePath = path.join(imgDir, storageName);
          const writeStream = fs.createWriteStream(filePath);
          let size = 0;
          stream.on('data', (chunk: Buffer) => { size += chunk.length; });
          stream.pipe(writeStream);
          writeStream.on('finish', () => {
            uploaded.push({
              filename,
              storage_path: storageName,
              public_url: `/img/${storageName}`,
              mime_type: mimeType,
              size,
            });
          });
        });

        bb.on('finish', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ files: uploaded }));
        });

        bb.on('error', (err: Error) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });

        req.pipe(bb);
      });
    },
  };
}

function lookupMime(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };
  return map[ext] ?? 'application/octet-stream';
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), uploadPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
