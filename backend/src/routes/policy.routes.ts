import { Router } from 'express';
import { PolicyController } from '../controllers/policy.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import {
  createPolicySchema,
  updatePolicySchema,
  getPoliciesQuerySchema,
  policyIdParamSchema,
} from '../validations/policy.validation';

const router = Router();
const controller = new PolicyController();

// GET /api/v1/policies/my-acknowledgments - View all policies accepted by logged-in employee
router.get(
  '/my-acknowledgments',
  authenticate,
  controller.getMyAcknowledgments
);

// POST /api/v1/policies - Draft new policy (HR/Admin)
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(createPolicySchema),
  controller.create
);

// GET /api/v1/policies - List policies (Employees view published; Admins view all)
router.get(
  '/',
  authenticate,
  validate(getPoliciesQuerySchema),
  controller.getAll
);

// GET /api/v1/policies/:id - View policy details and self-acknowledgment status
router.get(
  '/:id',
  authenticate,
  validate(policyIdParamSchema),
  controller.getById
);

// PUT /api/v1/policies/:id - Update policy terms
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(updatePolicySchema),
  controller.update
);

// PATCH /api/v1/policies/:id/publish - Officially publish policy
router.patch(
  '/:id/publish',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(policyIdParamSchema),
  controller.publish
);

// POST /api/v1/policies/:id/acknowledge - Employee digitally signs policy
router.post(
  '/:id/acknowledge',
  authenticate,
  validate(policyIdParamSchema),
  controller.acknowledge
);

// GET /api/v1/policies/:id/compliance - Organizational compliance % report (HR/Admin)
router.get(
  '/:id/compliance',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(policyIdParamSchema),
  controller.getComplianceReport
);

// DELETE /api/v1/policies/:id - Soft-delete/Archive policy (Super Admin / HR Admin)
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(policyIdParamSchema),
  controller.delete
);

export default router;
