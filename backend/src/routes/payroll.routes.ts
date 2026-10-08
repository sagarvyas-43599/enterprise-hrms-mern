import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import {
  generatePayrollSchema,
  updatePayrollStatusSchema,
  getPayrollQuerySchema,
  payrollIdParamSchema,
} from '../validations/payroll.validation';

const router = Router();
const controller = new PayrollController();

// GET /api/v1/payroll/analytics - Corporate financial spend summary (HR/Admin)
router.get(
  '/analytics',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  controller.getAnalytics
);

// POST /api/v1/payroll/generate - Generate monthly salary slip (HR/Admin)
router.post(
  '/generate',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(generatePayrollSchema),
  controller.generate
);

// POST /api/v1/payroll/auto-sync - Auto generate payroll from Attendance (HR/Admin)
router.post(
  '/auto-sync',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  // Ideally, use a schema to validate employeeId, month, year. For now bypassing complex validation.
  controller.autoSync
);

// PATCH /api/v1/payroll/:id/status - Transition status to PROCESSED or PAID
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(updatePayrollStatusSchema),
  controller.updateStatus
);

// GET /api/v1/payroll - List salary slips (Employee sees self, Admin sees all)
router.get(
  '/',
  authenticate,
  validate(getPayrollQuerySchema),
  controller.getAll
);

// GET /api/v1/payroll/:id - Get individual payslip details
router.get(
  '/:id',
  authenticate,
  validate(payrollIdParamSchema),
  controller.getById
);

export default router;
