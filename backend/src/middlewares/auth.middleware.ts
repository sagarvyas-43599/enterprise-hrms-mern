import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { ApiError } from '../utils/apiResponse';
import { UserRepository } from '../repositories/user.repository';

const userRepo = new UserRepository();

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing or invalid format. Use Bearer <token>');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Bearer token cannot be empty');
    }

    const decoded = verifyAccessToken(token);

    // Verify user is still active in database
    const user = await userRepo.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact HR administration.');
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      employeeId: decoded.employeeId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
