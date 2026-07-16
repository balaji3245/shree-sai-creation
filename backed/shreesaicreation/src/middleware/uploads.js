import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadRoot);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${nanoid(8)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|pdf|mp4|webm/;
  const ext = path.extname(file.originalname || '').toLowerCase().replace('.', '');
  if (allowed.test(ext) || allowed.test(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error('Unsupported file type'));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

export function mapUploadedFiles(req) {
  const files = req.files || (req.file ? [req.file] : []);
  const host = `${req.protocol}://${req.get('host')}`;

  return files.map((file, index) => ({
    url: `${host}/uploads/${file.filename}`,
    key: file.filename,
    alt: '',
    sortOrder: index,
    isPrimary: index === 0,
  }));
}
