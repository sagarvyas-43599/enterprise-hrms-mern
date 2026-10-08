import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import { ApiError } from '../utils/apiResponse';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeesQuerySchema,
  employeeIdParamSchema,
} from '../validations/employee.validation';

const router = Router();
const controller = new EmployeeController();

// GET /api/v1/employees/stats/departments - Analytics summary
router.get(
  '/stats/departments',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER),
  controller.getStats
);

// GET /api/v1/employees/hierarchy/org-chart - Organization tree structure
router.get(
  '/hierarchy/org-chart',
  authenticate,
  controller.getOrgChart
);

// POST /api/v1/employees - Onboard new employee (Admin / HR Admin only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(createEmployeeSchema),
  controller.create
);

// GET /api/v1/employees - List employees with filters and search
router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER),
  validate(getEmployeesQuerySchema),
  controller.getAll
);

// GET /api/v1/employees/:id - Retrieve specific profile details
router.get(
  '/:id',
  authenticate,
  validate(employeeIdParamSchema),
  controller.getById
);

// PUT /api/v1/employees/:id - Update employee profile (HR / Admin or Self)
router.put(
  '/:id',
  authenticate,
  (req, _res, next) => {
    if (
      req.user?.role === UserRole.SUPER_ADMIN ||
      req.user?.role === UserRole.HR_ADMIN ||
      req.params.id === 'me' ||
      req.params.id === 'undefined' ||
      req.user?.employeeId === req.params.id ||
      req.user?.userId === req.params.id
    ) {
      return next();
    }
    return next(
      ApiError.forbidden(
        'Access Denied: You are only authorized to update your own employee profile'
      )
    );
  },
  validate(updateEmployeeSchema),
  controller.update
);

// DELETE /api/v1/employees/:id - Soft-delete employee
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(employeeIdParamSchema),
  controller.delete
);

export default router;
