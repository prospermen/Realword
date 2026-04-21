import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middlewares/auth.middlewares';
import { env } from '../../config/env';

const router = Router();
const uploadsDir = env.UPLOADS_DIR;
const maxAvatarSizeBytes = 2 * 1024 * 1024;

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

function buildUploadUrl(req: Request, filename: string) {
  if (env.PUBLIC_APP_URL) {
    return new URL(`/uploads/${filename}`, env.PUBLIC_APP_URL).toString();
  }

  const forwardedProtocol = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
  const protocol = forwardedProtocol || req.protocol;
  const host = forwardedHost || req.get('host') || `localhost:${process.env.PORT || 3000}`;

  return `${protocol}://${host}/uploads/${filename}`;
}

const upload = multer({
  storage,
  limits: { fileSize: maxAvatarSizeBytes },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpe?g)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        Object.assign(new Error('Only PNG and JPG images are allowed.'), {
          code: 'INVALID_FILE_TYPE',
        })
      );
    }
  },
});

router.post(
  '/avatar',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('avatar')(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(422).json({ errors: { body: ['Images must be 2 MB or smaller.'] } });
      }

      if (err) {
        return res.status(422).json({ errors: { body: [err.message] } });
      }

      next();
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(422).json({ errors: { body: ['No avatar file was uploaded.'] } });
    }

    const url = buildUploadUrl(req, req.file.filename);
    return res.json({ url });
  }
);

export default router;
