import express from 'express';
import busboy from 'busboy';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const imgDir = path.join(__dirname, 'dist', 'img');
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

function authCheck(req, res) {
  const token = process.env.IMG_UPLOAD_TOKEN;
  if (!token) return true;
  const auth = req.headers['authorization'] ?? '';
  if (auth !== `Bearer ${token}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

app.post('/api/upload', (req, res) => {
  if (!authCheck(req, res)) return;

  const bb = busboy({ headers: req.headers });
  const uploaded = [];

  bb.on('file', (fieldname, stream, info) => {
    const { filename, mimeType } = info;
    const ext = path.extname(filename);
    const storageName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(imgDir, storageName);
    const writeStream = fs.createWriteStream(filePath);
    let size = 0;
    stream.on('data', (chunk) => { size += chunk.length; });
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
    res.json({ files: uploaded });
  });

  bb.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  req.pipe(bb);
});

app.delete('/api/upload/:filename', (req, res) => {
  if (!authCheck(req, res)) return;
  const filename = path.basename(req.params.filename);
  const filePath = path.join(imgDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ ok: true });
});

app.use('/img', express.static(imgDir));
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
