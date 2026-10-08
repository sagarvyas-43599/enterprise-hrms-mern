import { Request } from 'express';
import { UserRole } from '../constants/enums';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  employeeId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
