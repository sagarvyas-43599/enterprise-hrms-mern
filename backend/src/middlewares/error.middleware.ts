import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env.config';
import { HttpStatusCode } from '../constants/enums';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errors: unknown[] = [];
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
  } else if ((err as any).name === 'ValidationError') {
    statusCode = HttpStatusCode.UNPROCESSABLE_ENTITY;
    message = 'Database Validation Error';
    errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    isOperational = true;
  } else if ((err as any).name === 'ZodError') {
    statusCode = HttpStatusCode.UNPROCESSABLE_ENTITY;
    message = 'Request Validation Error';
    errors = (err as any).issues?.map((issue: any) => ({
      field: issue.path.join('.').replace(/^(body|query|params)\./, ''),
      message: issue.message,
      code: issue.code,
    })) || [];
    isOperational = true;
  } else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    statusCode = HttpStatusCode.BAD_REQUEST;
    message = 'Malformed JSON request body format.';
    isOperational = true;
  } else if ((err as any).code === 11000) {
    statusCode = HttpStatusCode.CONFLICT;
    const field = Object.keys((err as any).keyValue || {})[0] || 'unknown';
    message = `Duplicate key violation: ${field} already exists.`;
    isOperational = true;
  } else if ((err as any).name === 'CastError') {
    statusCode = HttpStatusCode.BAD_REQUEST;
    message = `Invalid format for resource ID: ${(err as any).value}`;
    isOperational = true;
  } else if ((err as any).name === 'JsonWebTokenError') {
    statusCode = HttpStatusCode.UNAUTHORIZED;
    message = 'Invalid authentication token.';
    isOperational = true;
  } else if ((err as any).name === 'TokenExpiredError') {
    statusCode = HttpStatusCode.UNAUTHORIZED;
    message = 'Authentication token expired.';
    isOperational = true;
  }

  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    statusCode,
    message: err.message,
    stack: err.stack,
    isOperational,
  };

  if (statusCode >= 500) {
    logger.error(logPayload, `[UNHANDLED_EXCEPTION] ${err.message}`);
  } else {
    logger.warn(logPayload, `[CLIENT_ERROR] ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
