import { Response } from 'express';
import { isCelebrateError } from 'celebrate';

function errorHandler(err: any, res: Response) {
  console.error(err.stack);
  if (isCelebrateError(err)) {
    res.status(400).send({ message: `Ошибка: ${err.details.get('body')?.message.split('"').join("'")}` });
  } else {
    res.status(err.statusCode || 500).send({ message: err.message });
  }
}

export default errorHandler;
