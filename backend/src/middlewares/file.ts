import 'dotenv/config';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { BadRequestError } from '../errors';

const { UPLOAD_PATH_TEMP = 'uploads', UPLOAD_PATH = 'images', PUBLIC_PATH = 'public' } = process.env;

export function moveImageFromTemp(fileName: string) {
  fs.rename(
    path.join(__dirname, '..', '..', UPLOAD_PATH_TEMP, path.parse(path.basename(fileName)).name),
    path.join(__dirname, '..', '..', PUBLIC_PATH, UPLOAD_PATH, path.basename(fileName)),
    () => {}
  );
}

export function deleteOldImage(fileName: string) {
  fs.unlink(
    path.join(__dirname, '..', '..', PUBLIC_PATH, UPLOAD_PATH, path.basename(fileName)),
    () => {}
  );
}

const upload = multer({
  dest: UPLOAD_PATH_TEMP,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, callback) => {
    if (file.mimetype.slice(0, 5) !== 'image') {
      callback(new BadRequestError('Ошибка: Возможна загрузка только изображений'));
    } else {
      callback(null, true);
    }
  }
});

export default upload;
