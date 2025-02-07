import Joi from 'joi';
import { celebrate, Segments } from 'celebrate';

const productUpdateJoiSchema = Joi.object({
  title: Joi.string().min(2).max(30).messages({
    'string.base': '{#label} должно быть строкой',
    'string.min': '{#label} должно иметь не менее {#limit} символов',
    'string.max': '{#label} должно иметь не более {#limit} символов'
  }),
  image: Joi.object({
    fileName: Joi.string().required().messages({
      'string.base': '{#label} должно быть строкой',
      'any.required': '{#label} это обязательное поле'
    }),
    originalName: Joi.string().required().messages({
      'string.base': '{#label} должно быть строкой',
      'any.required': '{#label} это обязательное поле'
    }),
  }),
  category: Joi.string().messages({
    'string.base': '{#label} должно быть строкой'
  }),
  description: Joi.string().messages({
    'string.base': '{#label} должно быть строкой'
  }),
  price: Joi.number().allow(null).messages({
    'number.base': '{#label} должно быть числом или null'
  })
});

const validateProductUpdate = celebrate({ [Segments.BODY]: productUpdateJoiSchema });
export default validateProductUpdate;
