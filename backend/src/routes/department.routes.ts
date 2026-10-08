import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createDesignationSchema,
  updateDesignationSchema,
  departmentIdParamSchema,
  designationIdParamSchema,
  getDepartmentsQuerySchema,
  getDesignationsQuerySchema,
} from '../validations/department.validation';

const router = Router();
const controller = new DepartmentController();

// --- DESIGNATION ROUTES (Placed before parameterized :id) ---

// POST /api/v1/departments/designations - Create designation role (HR/Admin)
router.post(
  '/designations',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(createDesignationSchema),
  controller.createDesignation
);

// GET /api/v1/departments/designations/list - List designations with pay grades
router.get(
  '/designations/list',
  authenticate,
  validate(getDesignationsQuerySchema),
  controller.getAllDesignations
);

// PUT /api/v1/departments/designations/:id - Update designation
router.put(
  '/designations/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(updateDesignationSchema),
  controller.updateDesignation
);

// --- DEPARTMENT MASTER ROUTES ---

// POST /api/v1/departments - Create department
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(createDepartmentSchema),
  controller.createDepartment
);

// GET /api/v1/departments - List all departments with HOD details
router.get(
  '/',
  authenticate,
  validate(getDepartmentsQuerySchema),
  controller.getAllDepartments
);

// GET /api/v1/departments/:id - Get department details and member staff
router.get(
  '/:id',
  authenticate,
  validate(departmentIdParamSchema),
  controller.getDepartmentById
);

// PUT /api/v1/departments/:id - Update department info or HOD
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(updateDepartmentSchema),
  controller.updateDepartment
);

// DELETE /api/v1/departments/:id - Soft-delete department with safety check
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(departmentIdParamSchema),
  controller.deleteDepartment
);

export default router;
