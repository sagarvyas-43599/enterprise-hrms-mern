import { Router } from 'express';
import { RecruitmentController } from '../controllers/recruitment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validator.middleware';
import { UserRole } from '../constants/enums';
import {
  createJobPostingSchema,
  updateJobPostingSchema,
  getJobPostingsQuerySchema,
  createCandidateSchema,
  updateCandidateStageSchema,
  getCandidatesQuerySchema,
  recruitmentIdParamSchema,
} from '../validations/recruitment.validation';

const router = Router();
const controller = new RecruitmentController();

// GET /api/v1/recruitment/metrics - Overall recruitment & pipeline stats
router.get('/metrics', authenticate, controller.getMetrics);

// Job Postings
router.get('/jobs', authenticate, validate(getJobPostingsQuerySchema), controller.getJobPostings);
router.post(
  '/jobs',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(createJobPostingSchema),
  controller.createJobPosting
);
router.put(
  '/jobs/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(recruitmentIdParamSchema),
  validate(updateJobPostingSchema),
  controller.updateJobPosting
);
router.delete(
  '/jobs/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(recruitmentIdParamSchema),
  controller.deleteJobPosting
);

// Candidates Pipeline
router.get('/candidates', authenticate, validate(getCandidatesQuerySchema), controller.getCandidates);
router.post(
  '/candidates',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER),
  validate(createCandidateSchema),
  controller.createCandidate
);
router.patch(
  '/candidates/:id/stage',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER),
  validate(recruitmentIdParamSchema),
  validate(updateCandidateStageSchema),
  controller.updateCandidateStage
);

export default router;
