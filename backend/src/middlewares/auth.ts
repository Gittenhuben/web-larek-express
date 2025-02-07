import 'dotenv/config';
import jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../errors';

const { SECRET_ACCESS_KEY = 'secret-access-key' } = process.env;

export interface SessionRequest extends Request {
  userId?: string;
}

export default (req: SessionRequest, _:Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthorizationError('Ошибка: Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, SECRET_ACCESS_KEY);
  } catch (err) {
    return next(new AuthorizationError('Ошибка: Необходима авторизация'));
  }

  req.userId = (payload as jwt.JwtPayload)._id;

  return next();
};
