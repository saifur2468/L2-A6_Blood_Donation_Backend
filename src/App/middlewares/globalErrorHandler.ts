import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import handleZodError from '../errors/handleZodError.js';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Default Error Values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources = [
    {
      path: '',
      message: err?.message || 'Internal Server Error',
    },
  ];

  // Zod Error Catching
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  // Response Return
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;