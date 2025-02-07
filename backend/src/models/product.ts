import { model, Schema } from 'mongoose';

import { IImage, IProduct } from '../types/product';

const imageSchema = new Schema<IImage>({
  fileName: {
    type: String,
    required: [true, 'fileName - это обязательное поле']
  },
  originalName: {
    type: String,
    required: [true, 'originalName - это обязательное поле']
  }
});

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'title - это обязательное поле'],
    minlength: [2, 'title - должно иметь длину не менее 2'],
    maxlength: [30, 'title - должно иметь длину не более 30'],
    unique: true
  },
  image: {
    type: imageSchema,
    required: [true, 'image - это обязательное поле']
  },
  category: {
    type: String,
    required: [true, 'category - это обязательное поле']
  },
  description: {
    type: String
  },
  price: {
    type: Number
  }
});

export default model<IProduct>('product', productSchema);
