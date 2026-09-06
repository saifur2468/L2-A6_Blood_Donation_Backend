// import { ErrorRequestHandler } from 'express';
// import { ZodError } from 'zod';
// import handleZodError from '../errors/handleZodError.js';

// const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {

//   let statusCode = 500;
//   let message = 'Something went wrong!';
//   let errorSources = [
//     {
//       path: '',
//       message: err?.message || 'Internal Server Error',
//     },
//   ];

//   // Zod Error Catching
//   if (err instanceof ZodError) {
//     const simplifiedError = handleZodError(err);
//     statusCode = simplifiedError.statusCode;
//     message = simplifiedError.message;
//     errorSources = simplifiedError.errorSources;
//   }

//   // Response Return
//   res.status(statusCode).json({
//     success: false,
//     message,
//     errorSources,
//     stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
//   });
// };

// export default globalErrorHandler;





import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import AppError from '../errors/AppError.js';
import handleZodError from '../errors/handleZodError.js';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources = [
    {
      path: '',
      message: err?.message || 'Internal Server Error',
    },
  ];

 
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } 

  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: req.originalUrl || '',
        message: err.message,
      },
    ];
  } 
 
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: req.originalUrl || '',
        message: err.message,
      },
    ];
  }

 
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;