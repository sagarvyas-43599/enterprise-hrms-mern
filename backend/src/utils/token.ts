import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { AuthenticatedUser } from '../@types/express';
import { ApiError } from './apiResponse';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  employeeId?: string;
}

export const generateAuthTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign({ userId: payload.userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyAccessToken = (token: string): AuthenticatedUser => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired. Please refresh your session.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Refresh token has expired. Please login again.');
    }
    throw ApiError.unauthorized('Invalid refresh token.');
  }
};
