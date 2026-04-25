import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const imgDir = path.join(__dirname, 'dist', 'img');
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imgDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /image\/(jpeg|png|gif|webp|svg\+xml)|video\/|application\/pdf/;
    cb(null, allowed.test(file.mimetype));
  },
});

// Upload endpoint — requires simple bearer token from IMG_UPLOAD_TOKEN env var
app.post('/api/upload', (req, res) => {
  const token = process.env.IMG_UPLOAD_TOKEN;
  if (token) {
    const auth = req.headers['authorization'] ?? '';
    if (auth !== `Bearer ${token}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  upload.array('files')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const uploaded = (req.files ?? []).map((f) => ({
      filename: f.originalname,
      storage_path: f.filename,
      public_url: `/img/${f.filename}`,
      mime_type: f.mimetype,
      size: f.size,
    }));
    res.json({ files: uploaded });
  });
});

// Delete endpoint
app.delete('/api/upload/:filename', express.json(), (req, res) => {
  const token = process.env.IMG_UPLOAD_TOKEN;
  if (token) {
    const auth = req.headers['authorization'] ?? '';
    if (auth !== `Bearer ${token}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const filename = path.basename(req.params.filename);
  const filePath = path.join(imgDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ ok: true });
});

// Serve /img/ statically
app.use('/img', express.static(imgDir));

// Serve built frontend
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
