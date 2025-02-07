import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';

import Product from '../models/product';
import { IOrder } from '../types/order';
import { BadRequestError } from '../errors';

const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const { items, total }: IOrder = req.body;
  const uniqueItems = Array.from(new Set(items));

  return Product.find({ _id: { $in: uniqueItems } }, { price: 1 })
    .then(products => {
      if (uniqueItems.length !== products.length) {
        throw new BadRequestError('Ошибка: Товар отсутствует в базе данных');
      }

      if (products.find(elem => elem.price === null)) {
        throw new BadRequestError('Ошибка: Товар не продается');
      }

      const itemsTotal = items.map(item => {
        return products.find(product => product._id.toString() === item)?.price!;
      }).reduce((acc, price) => {
        return acc + price;
      }, 0);

      if (itemsTotal !== total) {
        throw new BadRequestError('Ошибка: Неверная итоговая стоимость');
      }

      res.send({ id: faker.string.uuid(), total: itemsTotal });
    })
    .catch(error => next(error));
};

export default createOrder;
