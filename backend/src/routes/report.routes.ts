import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';

const router = Router();
const controller = new ReportController();

// GET /api/v1/reports/executive-summary - Multi-module Executive BI Analytics
router.get(
  '/executive-summary',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER),
  controller.getExecutiveSummary
);

export default router;
