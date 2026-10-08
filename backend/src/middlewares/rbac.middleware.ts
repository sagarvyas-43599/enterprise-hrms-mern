import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/enums';
import { ApiError } from '../utils/apiResponse';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('User must be authenticated before checking permissions'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access Denied: Requires one of [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'`
        )
      );
    }

    next();
  };
};
