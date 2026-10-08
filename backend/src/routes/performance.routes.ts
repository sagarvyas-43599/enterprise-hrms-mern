import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import {
  createGoalSchema,
  updateGoalProgressSchema,
  createAppraisalCycleSchema,
  submitSelfReviewSchema,
  submitManagerReviewSchema,
  getGoalsQuerySchema,
  getAppraisalsQuerySchema,
} from '../validations/performance.validation';

const router = Router();
const controller = new PerformanceController();

// --- GOALS & OKRs ---

// POST /api/v1/performance/goals - Create new goal/OKR
router.post(
  '/goals',
  authenticate,
  validate(createGoalSchema),
  controller.createGoal
);

// GET /api/v1/performance/goals - List goals (Employee sees self, Admin/Manager sees team)
router.get(
  '/goals',
  authenticate,
  validate(getGoalsQuerySchema),
  controller.getGoals
);

// GET /api/v1/performance/goals/stats - Goal completion and progress stats
router.get(
  '/goals/stats',
  authenticate,
  controller.getGoalStats
);

// PATCH /api/v1/performance/goals/:id/progress - Update progress % (0-100)
router.patch(
  '/goals/:id/progress',
  authenticate,
  validate(updateGoalProgressSchema),
  controller.updateGoalProgress
);

// --- APPRAISALS & REVIEWS ---

// POST /api/v1/performance/appraisals/initiate - Start cycle for employee (HR/Admin)
router.post(
  '/appraisals/initiate',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(createAppraisalCycleSchema),
  controller.initiateAppraisal
);

// GET /api/v1/performance/appraisals/metrics - Performance rating distribution curve (HR/Admin)
router.get(
  '/appraisals/metrics',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  controller.getMetrics
);

// GET /api/v1/performance/appraisals - List appraisals (Employee sees self, Manager sees reports)
router.get(
  '/appraisals',
  authenticate,
  validate(getAppraisalsQuerySchema),
  controller.getAppraisals
);

// PATCH /api/v1/performance/appraisals/:id/self-review - Employee submits self rating & comments
router.patch(
  '/appraisals/:id/self-review',
  authenticate,
  validate(submitSelfReviewSchema),
  controller.submitSelfReview
);

// PATCH /api/v1/performance/appraisals/:id/manager-review - Manager submits rating & promotion recommendation
router.patch(
  '/appraisals/:id/manager-review',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER),
  validate(submitManagerReviewSchema),
  controller.submitManagerReview
);

export default router;
