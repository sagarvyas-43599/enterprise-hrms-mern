import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiError } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';

interface DynamicRateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export const createRateLimiter = (options: DynamicRateLimiterOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (_req: Request, _res: Response, next) => {
      next(new ApiError(HttpStatusCode.TOO_MANY_REQUESTS, message));
    },
  });
};

export const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Global rate limit exceeded. Please throttle your requests.',
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many authentication attempts. Account temporarily locked for 15 minutes.',
  skipSuccessfulRequests: true,
});

export const attendanceLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Attendance action rate limit exceeded. Please wait a moment before trying again.',
});
