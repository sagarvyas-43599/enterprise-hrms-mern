import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validator.middleware';
import { updateSettingsSchema } from '../validations/setting.validation';
import { UserRole } from '../constants/enums';

const router = Router();
const controller = new SettingController();

// GET /api/v1/settings - View company settings (All authenticated employees)
router.get(
  '/',
  authenticate,
  controller.getSettings
);

// PUT /api/v1/settings - Update company settings (Super Admin & HR Admin only)
router.put(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(updateSettingsSchema),
  controller.updateSettings
);

export default router;
