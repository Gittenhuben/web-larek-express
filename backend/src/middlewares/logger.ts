import 'dotenv/config';
import winston from 'winston';
import expressWinston from 'express-winston';

const { REQUEST_LOG_FILENAME = 'request.log', ERROR_LOG_FILENAME = 'error.log' } = process.env;

const winstonFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(info => JSON.stringify({
    timestamp: info.timestamp,
    level: info.level,
    message: info.message,
    meta: info.meta
  }))
);

export const requestLogger = expressWinston.logger({
  level: 'info',
  format: winstonFormat,
  transports: [
    new winston.transports.File({ filename: REQUEST_LOG_FILENAME }),
  ]
});

export const errorLogger = expressWinston.errorLogger({
  level: 'error',
  format: winstonFormat,
  transports: [
    new winston.transports.File({ filename: ERROR_LOG_FILENAME }),
  ]
});
