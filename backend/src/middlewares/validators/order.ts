import Joi from 'joi';
import { celebrate, Segments } from 'celebrate';

const orderJoiSchema = Joi.object({
  items: Joi.array().items(Joi.string().messages({
    'string.base': 'Массив "items" должен содержать строки'
  })).min(1).required().messages({
    'array.base': '{#label} должно быть массивом',
    'array.min': 'Массив {#label} не должен быть пустым',
    'any.required': '{#label} это обязательное поле'
  }),
  total: Joi.number().integer().required().messages({
    'number.base': '{#label} должно быть числом',
    'number.integer': '{#label} должно быть целым числом',
    'any.required': '{#label} это обязательное поле'
  }),
  payment: Joi.string().valid('online', 'card').required().messages({
    'string.base': '{#label} должно быть строкой',
    'any.only': '{#label} должно иметь одно из следующих значений: {#valids}',
    'any.required': '{#label} это обязательное поле'
  }),
  email: Joi.string().email().required().messages({
    'string.base': '{#label} должно быть строкой',
    'string.email': '{#label} должен быть корректным email',
    'any.required': '{#label} это обязательное поле'
  }),
  phone: Joi.string().required().messages({
    'string.base': '{#label} должно быть строкой',
    'any.required': '{#label} это обязательное поле'
  }),
  address: Joi.string().required().messages({
    'string.base': '{#label} должно быть строкой',
    'any.required': '{#label} это обязательное поле'
  })
});

const validateOrder = celebrate({ [Segments.BODY]: orderJoiSchema });
export default validateOrder;
