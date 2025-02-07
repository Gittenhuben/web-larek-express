import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import ms, { StringValue } from 'ms';
import { ObjectId } from 'mongodb';

import User from '../models/user';
import { IUser } from '../types/user';
import { SessionRequest } from '../middlewares/auth';
import { AuthorizationError, BadRequestError, ConflictError, NotFoundError } from '../errors';

const COOKIE_NAME = 'refreshToken';
const {
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  SECRET_REFRESH_KEY = 'secret-refresh-key',
  SECRET_ACCESS_KEY = 'secret-access-key'
} = process.env;


function getUserIdByRefreshToken(req: Request):Promise<string> {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    throw new BadRequestError('Ошибка: Нет куки');
  }

  let payload;
  try {
    payload = jwt.verify(token, SECRET_REFRESH_KEY);
  } catch (err) {
    throw new AuthorizationError('Ошибка: Неправильный токен');
  }

  const userId = (payload as jwt.JwtPayload)._id;

  return User.findOne({ _id: userId }).select('+tokens')
    .then(user => {
      if (!user) {
        throw new NotFoundError('Ошибка: Неправильный токен');
      }

      if (!user.tokens.some(t => t.token === token)) {
        throw new AuthorizationError('Ошибка: Неправильный токен');
      }

      return userId;
    });
}


function createTokens(userId: string, res: Response, status = 200) {
  const accessToken = jwt.sign({ _id: userId }, SECRET_ACCESS_KEY, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ _id: userId }, SECRET_REFRESH_KEY, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY });

  return User.findOneAndUpdate(
    { _id: userId },
    { $set: { tokens: [{ token: refreshToken }] } },
    { returnDocument: 'after' }
  )
    .then(user => {
      if (!user) {
        throw new AuthorizationError('Ошибка: Токены не добавились в базу данных');
      }

      let refreshExpiryMs;
      try {
        refreshExpiryMs = ms(AUTH_REFRESH_TOKEN_EXPIRY as StringValue);
      } catch {
        refreshExpiryMs = 7 * 24 * 60 * 60 * 1000;
      }

      res.cookie(COOKIE_NAME, refreshToken, {
        sameSite: 'lax',
        secure: false,
        httpOnly: true,
        path: '/',
        maxAge: refreshExpiryMs
      });
      res.status(status).send({
        user: {
          email: user.email,
          name: user.name
        },
        success: true,
        accessToken
      });
    });
}


export const getUserInfo = (req: SessionRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  return User.findOne({ _id: userId })
    .then(user => {
      if (!user) {
        throw new NotFoundError('Ошибка: Пользователь не найден');
      }
      res.send({
        user: {
          email: user.email,
          name: user.name
        },
        success: true
      });
    })
    .catch(error => next(error));
}


export const refreshTokens = (req: Request, res: Response, next: NextFunction) => {
  return getUserIdByRefreshToken(req)
    .then(userId => {
      if (!userId) {
        throw new AuthorizationError('Ошибка: Неправильный токен');
      }

      createTokens(userId, res);
    })
    .catch(error => next(error));
}


export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  return getUserIdByRefreshToken(req)
    .then(userId => {
      if (!userId) {
        throw new AuthorizationError('Ошибка: Неправильный токен');
      }

      return User.findOneAndUpdate(
        { _id: userId },
        { $set: { tokens: [] } },
        { returnDocument: 'after' }
      );
    })
    .then(user => {
      if (!user) {
        throw new Error('Ошибка: Токены не удалились из базы данных');
      }

      res.cookie(COOKIE_NAME, '', {
        sameSite: 'lax',
        secure: false,
        httpOnly: true,
        path: '/',
        maxAge: 0
      });
      res.send({
        success: true
      });
    })
    .catch(error => next(error));
}


export const loginUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password }:IUser = req.body;
  return User.findUserByCredentials(email, password)
    .then(user => {
      if (!user) {
        throw new AuthorizationError('Ошибка: Неверный логин или пароль');
      }

      createTokens((user._id as ObjectId).toString(), res);
    })
    .catch(error => next(error));
}


export const registerUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password }:IUser = req.body;
  return bcrypt.hash(password, 10)
    .then((hash: string) => User.create({
      name: name || 'Ё-мое',
      email,
      password: hash,
      tokens: []
    }))
    .then(user => {
      if (!user) {
        throw new BadRequestError('Ошибка: Ошибка регистрации нового пользователя');
      }
      createTokens((user._id as ObjectId).toString(), res, 201);
    })
    .catch(error => {
      if (error.code === 11000) {
        next(new ConflictError('Ошибка: Пользователь с таким email уже существует'));
      } else {
        next(error);
      }
    });
}
