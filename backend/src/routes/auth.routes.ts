import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import {
  loginSchema,
  registerUserSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from '../validations/auth.validation';

const router = Router();
const controller = new AuthController();

// POST /api/v1/auth/login - Rate limited for brute-force protection
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  controller.login
);

// POST /api/v1/auth/register - Create employee & user credentials
router.post(
  '/register',
  validate(registerUserSchema),
  controller.register
);

// GET /api/v1/auth/me - Retrieve current authenticated profile
router.get(
  '/me',
  authenticate,
  controller.me
);

// POST /api/v1/auth/change-password - Update credentials securely
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  controller.changePassword
);

// POST /api/v1/auth/refresh-token - Renew access token session
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  controller.refreshToken
);

export default router;
