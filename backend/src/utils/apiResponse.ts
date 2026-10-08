import { HttpStatusCode } from '../constants/enums';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: unknown[];

  constructor(
    statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
    message: string = 'Internal Server Error',
    errors: unknown[] = [],
    isOperational: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg = 'Bad Request', errors: unknown[] = []): ApiError {
    return new ApiError(HttpStatusCode.BAD_REQUEST, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized access'): ApiError {
    return new ApiError(HttpStatusCode.UNAUTHORIZED, msg);
  }

  static forbidden(msg = 'Forbidden: Access Denied'): ApiError {
    return new ApiError(HttpStatusCode.FORBIDDEN, msg);
  }

  static notFound(msg = 'Resource not found'): ApiError {
    return new ApiError(HttpStatusCode.NOT_FOUND, msg);
  }

  static conflict(msg = 'Resource conflict'): ApiError {
    return new ApiError(HttpStatusCode.CONFLICT, msg);
  }

  static unprocessable(msg = 'Validation Failed', errors: unknown[] = []): ApiError {
    return new ApiError(HttpStatusCode.UNPROCESSABLE_ENTITY, msg, errors);
  }

  static internal(msg = 'Internal Server Error'): ApiError {
    return new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, msg, [], false);
  }
}

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;
  public readonly meta?: Record<string, unknown>;

  constructor(
    statusCode: number,
    data?: T,
    message: string = 'Success',
    meta?: Record<string, unknown>
  ) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
    if (meta !== undefined) {
      this.meta = meta;
    }
  }

  static ok<T>(data?: T, message = 'Success', meta?: Record<string, unknown>): ApiResponse<T> {
    return new ApiResponse(HttpStatusCode.OK, data, message, meta);
  }

  static created<T>(data?: T, message = 'Resource created successfully'): ApiResponse<T> {
    return new ApiResponse(HttpStatusCode.CREATED, data, message);
  }

  static noContent(): ApiResponse<null> {
    return new ApiResponse(HttpStatusCode.NO_CONTENT, null, 'No content');
  }
}
