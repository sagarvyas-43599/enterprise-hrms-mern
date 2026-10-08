import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import {
  createAssetSchema,
  updateAssetSchema,
  allocateAssetSchema,
  returnAssetSchema,
  getAssetsQuerySchema,
  assetIdParamSchema,
} from '../validations/asset.validation';

const router = Router();
const controller = new AssetController();

// GET /api/v1/assets/metrics - Inventory metrics and valuation summary
router.get(
  '/metrics',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  controller.getMetrics
);

// GET /api/v1/assets/my-assets - Employee self-service view of allocated company equipment
router.get(
  '/my-assets',
  authenticate,
  controller.getMyAssets
);

// POST /api/v1/assets - Add new inventory hardware item (HR/Admin)
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(createAssetSchema),
  controller.create
);

// GET /api/v1/assets - List assets (Admins view all, Employees view self)
router.get(
  '/',
  authenticate,
  validate(getAssetsQuerySchema),
  controller.getAll
);

// PUT /api/v1/assets/:id - Update asset details
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(updateAssetSchema),
  controller.update
);

// PATCH /api/v1/assets/:id/allocate - Assign asset to an employee
router.patch(
  '/:id/allocate',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(allocateAssetSchema),
  controller.allocate
);

// PATCH /api/v1/assets/:id/return - Return asset back to inventory
router.patch(
  '/:id/return',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(returnAssetSchema),
  controller.returnAsset
);

// DELETE /api/v1/assets/:id - Soft-delete asset item
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(assetIdParamSchema),
  controller.delete
);

export default router;
