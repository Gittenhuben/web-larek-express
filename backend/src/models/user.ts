import { model, Model, Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import { AuthorizationError } from '../errors';
import { IUser, IToken } from '../types/user';

type UserDocument<A, B, C> = Document<A, B, C> & IUser;

interface IUserModel extends Model<IUser> {
  findUserByCredentials: (email: string, password: string) => Promise<UserDocument<unknown, any, IUser>>
}

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
  }
});

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'name - должно иметь длину не менее 2'],
    maxlength: [30, 'name - должно иметь длину не более 30'],
    default: 'Ё-мое'
  },
  email: {
    type: String,
    required: [true, 'email - это обязательное поле'],
    unique: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Неправильный формат email'
    }
  },
  password: {
    type: String,
    minlength: [6, 'password - должен иметь длину не менее 6'],
    required: [true, 'password - это обязательное поле'],
    select: false
  },
  tokens: [{
    type: tokenSchema,
    select: false
  }]
});

userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
  return this.findOne({ email }).select('+password').then((user:UserDocument<unknown, any, IUser>) => {
    if (!user) {
      return Promise.reject(new AuthorizationError('Ошибка: Неправильные почта или пароль'));
    }
    return bcrypt.compare(password, user.password).then(matched => {
      if (!matched) {
        return Promise.reject(new AuthorizationError('Ошибка: Неправильные почта или пароль'));
      }
      return user;
    });
  });
});

export default model<IUser, IUserModel>('user', userSchema);
