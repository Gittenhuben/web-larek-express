import { Request, Response, NextFunction } from 'express';

import Product from '../models/product';
import { ConflictError, NotFoundError } from '../errors';
import { IProduct } from '../types/product';
import { moveImageFromTemp, deleteOldImage } from '../middlewares/file';


export const getProducts = (_: Request, res: Response, next: NextFunction) => {
  return Product.find({}, {
    'image.fileName': 1,
    'image.originalName': 1,
    title: 1,
    category: 1,
    description: 1,
    price: 1
  })
    .then(posts => {
      res.send({ items: posts, total: posts.length });
    })
    .catch(error => next(error));
};


export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const { description, image: { fileName, originalName }, title, category, price }:IProduct = req.body;
  return Product.create({ image: { fileName, originalName }, title, category, description, price })
    .then(product => {
      if (!product) {
        throw new Error('Ошибка: Ошибка записи в базу данных');
      }

      res.send({
        _id: product._id,
        image: {
          fileName: product.image.fileName,
          originalName: product.image.originalName
        },
        title: product.title,
        category: product.category,
        description: product.description,
        price: product.price || null
      });

      moveImageFromTemp(product.image.fileName);
    })
    .catch(error => {
      if (error.code === 11000) {
        next(new ConflictError('Ошибка: Товар с таким наименованием уже существует'));
      } else {
        next(error);
      }
    });
};


function updateProductObject(dest:Partial<IProduct>, src:Partial<IProduct>) {
  if (src.description) dest.description = src.description;
  if (src.image) {
    if (src.image.fileName && src.image.originalName) {
      dest.image = { fileName: src.image.fileName, originalName: src.image.originalName };
    }
  }
  if (src.title) dest.title = src.title;
  if (src.category) dest.category = src.category;
  if (src.price || src.price === null) dest.price = src.price;
}


export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  let needImageMove = false;
  if (req.body.image) {
    needImageMove = !!req.body.image.fileName && !!req.body.image.originalName;
  }

  const update:Partial<IProduct> = {};
  updateProductObject(update, req.body);

  return Product.findOneAndUpdate(
    { _id: req.params.productId },
    { $set: update },
    { runValidators: true, new: false }
  )
    .then(product => {
      if (!product) {
        throw new NotFoundError('Ошибка: Товар не найден');
      }

      let oldImageFileName = '';
      if (needImageMove) {
        oldImageFileName = product.image.fileName;
      }

      updateProductObject(product, req.body);

      res.send({
        _id: product._id,
        image: {
          fileName: product.image.fileName,
          originalName: product.image.originalName
        },
        title: product.title,
        category: product.category,
        description: product.description,
        price: product.price || null
      });

      if (needImageMove) {
        moveImageFromTemp(product.image.fileName);
        deleteOldImage(oldImageFileName);
      }
    })
    .catch(error => {
      if (error.code === 11000) {
        next(new ConflictError('Ошибка: Товар с таким наименованием уже существует'));
      } else if (error.name === 'CastError') {
        next(new NotFoundError('Ошибка: Товар не найден'));
      } else {
        next(error);
      }
    });
};


export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  return Product.findOneAndDelete(
    { _id: req.params.productId },
    { new: false }
  )
    .then(product => {
      if (!product) {
        throw new NotFoundError('Ошибка: Товар не найден');
      }

      res.send({
        _id: product._id,
        image: {
          fileName: product.image.fileName,
          originalName: product.image.originalName
        },
        title: product.title,
        category: product.category,
        description: product.description,
        price: product.price || null
      });

      deleteOldImage(product.image.fileName);
    })
    .catch(error => {
      if (error.code === 11000) {
        next(new ConflictError('Ошибка: Товар с таким наименованием уже существует'));
      } else if (error.name === 'CastError') {
        next(new NotFoundError('Ошибка: Товар не найден'));
      } else {
        next(error);
      }
    });
};
