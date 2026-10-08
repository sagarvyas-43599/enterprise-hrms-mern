import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validator.middleware';
import { UserRole } from '../constants/enums';
import {
  createExpenseSchema,
  updateExpenseStatusSchema,
  getExpensesQuerySchema,
  expenseIdParamSchema,
} from '../validations/expense.validation';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Employee routes
router.post('/', validate(createExpenseSchema), expenseController.createExpense);
router.get('/my', validate(getExpensesQuerySchema), expenseController.getMyExpenses);
router.put('/:id', validate(expenseIdParamSchema), expenseController.updateExpense);
router.delete('/:id', validate(expenseIdParamSchema), expenseController.deleteExpense);

// Manager/Admin routes
router.get('/', authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), validate(getExpensesQuerySchema), expenseController.getAllExpenses);
router.get('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), validate(expenseIdParamSchema), expenseController.getExpenseById);
router.patch('/:id/status', authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.MANAGER), validate(expenseIdParamSchema), validate(updateExpenseStatusSchema), expenseController.updateExpenseStatus);

export default router;
