import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import { productsRouter, ordersRouter, authRouter, uploadRouter } from './routes';
import errorHandler from './middlewares/errorHandler';
import { NotFoundError } from './errors';
import { requestLogger, errorLogger } from './middlewares/logger';

const {
  PORT = 3000,
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  ORIGIN_ALLOW,
  PUBLIC_PATH = 'public'
} = process.env;

const corsOptions = {
  origin: ORIGIN_ALLOW,
  credentials: true
}

mongoose.connect(DB_ADDRESS);

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '..', PUBLIC_PATH)));

app.use(requestLogger);

app.use('/product', productsRouter);
app.use('/order', ordersRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

app.use((_: Request, __: Response, next: NextFunction) => {
  next(new NotFoundError('Ошибка: страница не найдена'));
});

app.use(errorLogger);

app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  errorHandler(err, res);
});

app.listen(PORT, () => console.log(`Server Started, Port: ${PORT}`));
