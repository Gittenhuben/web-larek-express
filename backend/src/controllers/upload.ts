import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

import { BadRequestError } from '../errors';

const { UPLOAD_PATH = 'images' } = process.env;

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  const fileInfo = req.file;

  if (!fileInfo) {
    next(new BadRequestError('Ошибка: Нет файла'));
    return;
  }

  res.send({
    fileName: path.posix.join('/', UPLOAD_PATH, path.basename(fileInfo.filename)) + path.extname(fileInfo.originalname),
    originalName: path.basename(fileInfo.originalname)
  });
};

export default uploadFile;
