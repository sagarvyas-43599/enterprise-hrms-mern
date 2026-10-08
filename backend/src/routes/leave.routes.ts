import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import {
  applyLeaveSchema,
  reviewLeaveSchema,
  getLeavesQuerySchema,
  leaveIdParamSchema,
} from '../validations/leave.validation';

const router = Router();
const controller = new LeaveController();

// POST /api/v1/leaves/apply - Submit new leave application
router.post(
  '/apply',
  authenticate,
  validate(applyLeaveSchema),
  controller.apply
);

// GET /api/v1/leaves/balances - View current year leave quotas and remaining balances
router.get(
  '/balances',
  authenticate,
  controller.getBalances
);

// GET /api/v1/leaves - List leaves (Scoped to self for employees, enterprise-wide for HR/Admin)
router.get(
  '/',
  authenticate,
  validate(getLeavesQuerySchema),
  controller.getAll
);

// PATCH /api/v1/leaves/:id/review - Manager or HR approval / rejection
router.patch(
  '/:id/review',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER),
  validate(reviewLeaveSchema),
  controller.review
);

// PATCH /api/v1/leaves/:id/cancel - Employee cancels pending leave
router.patch(
  '/:id/cancel',
  authenticate,
  validate(leaveIdParamSchema),
  controller.cancel
);

export default router;
