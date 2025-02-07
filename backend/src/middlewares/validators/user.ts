import Joi from 'joi';
import { celebrate, Segments } from 'celebrate';

const userJoiSchema = Joi.object({
  name: Joi.string().min(2).max(30).messages({
    'string.base': '{#label} должно быть строкой',
    'string.min': '{#label} должно иметь не менее {#limit} символов',
    'string.max': '{#label} должно иметь не более {#limit} символов'
  }),
  email: Joi.string().email().required().messages({
    'string.base': '{#label} должно быть строкой',
    'string.email': '{#label} должен быть корректным email',
    'any.required': '{#label} это обязательное поле'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': '{#label} должно быть строкой',
    'string.min': '{#label} должно иметь не менее {#limit} символов',
    'any.required': '{#label} это обязательное поле'
  })
});

const validateUser = celebrate({ [Segments.BODY]: userJoiSchema });
export default validateUser;
