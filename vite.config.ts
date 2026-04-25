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

      server.middlewares.use('/api/upload', async (req, res) => {
        if (req.method === 'DELETE') {
          const filename = path.basename((req.url ?? '').replace(/^\//, ''));
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

        const { default: busboy } = await import('busboy');
        const bb = busboy({ headers: req.headers });
        const uploaded: { filename: string; storage_path: string; public_url: string; mime_type: string; size: number }[] = [];
        const pending: Promise<void>[] = [];

        bb.on('file', (_field, stream, info) => {
          const ext = path.extname(info.filename);
          const storageName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
          const filePath = path.join(imgDir, storageName);
          const ws = fs.createWriteStream(filePath);
          let size = 0;
          stream.on('data', (chunk: Buffer) => { size += chunk.length; });

          const done = new Promise<void>((resolve, reject) => {
            ws.on('finish', () => {
              uploaded.push({
                filename: info.filename,
                storage_path: storageName,
                public_url: `/img/${storageName}`,
                mime_type: info.mimeType,
                size,
              });
              resolve();
            });
            ws.on('error', reject);
          });

          pending.push(done);
          stream.pipe(ws);
        });

        bb.on('finish', async () => {
          try {
            await Promise.all(pending);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ files: uploaded }));
          } catch (err: unknown) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
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

export default defineConfig({
  plugins: [react(), uploadPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
