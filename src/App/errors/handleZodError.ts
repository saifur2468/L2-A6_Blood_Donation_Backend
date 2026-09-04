import type { ZodError } from 'zod';

export type TErrorSources = {
  path: string;
  message: string;
}[];

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};

const handleZodError = (err: ZodError): TGenericErrorResponse => {
 
  const errorSources: TErrorSources = err.issues.map((issue) => {
    const lastPath = issue.path[issue.path.length - 1];

    return {
      path: lastPath !== undefined ? String(lastPath) : '',
      message: issue.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleZodError;