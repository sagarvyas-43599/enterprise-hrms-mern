import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { attendanceLimiter } from '../middlewares/rateLimiter.middleware';
import {
  clockInSchema,
  clockOutSchema,
  getAttendanceQuerySchema,
  regularizeAttendanceSchema,
} from '../validations/attendance.validation';
import { UserRole } from '../constants/enums';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();
const controller = new AttendanceController();

// POST /api/v1/attendance/clock-in
router.post(
  '/clock-in',
  authenticate,
  attendanceLimiter,
  validate(clockInSchema),
  controller.clockIn
);

// POST /api/v1/attendance/clock-out
router.post(
  '/clock-out',
  authenticate,
  attendanceLimiter,
  validate(clockOutSchema),
  controller.clockOut
);

// GET /api/v1/attendance/history
router.get(
  '/history',
  authenticate,
  validate(getAttendanceQuerySchema),
  controller.getHistory
);

// POST /api/v1/attendance/regularize
router.post(
  '/regularize',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(regularizeAttendanceSchema),
  controller.regularize
);

export default router;
