import { Request, Response, NextFunction } from 'express';
import { expenseService } from '../services/expense.service';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { EmployeeModel } from '../models/employee.model';
import { ExpensesQueryParams } from '../validations/expense.validation';

export class ExpenseController {
  async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');
      
      const expense = await expenseService.createExpense(req.body, employee._id.toString());
      res.status(201).json(ApiResponse.created(expense, 'Expense claim submitted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getMyExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');

      const baseFilter: any = { employee: employee._id };
      
      const data = await expenseService.getExpenses(baseFilter, req.query as any as ExpensesQueryParams, req.user!.role);
      res.status(200).json(ApiResponse.ok(data, 'My expenses retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAllExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const baseFilter: any = {};
      if (req.query.employee) baseFilter.employee = req.query.employee;
      
      const data = await expenseService.getExpenses(baseFilter, req.query as any as ExpensesQueryParams, req.user!.role);
      res.status(200).json(ApiResponse.ok(data, 'All expenses retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getExpenseById(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.getExpenseById(req.params.id as string);
      res.status(200).json(ApiResponse.ok(expense, 'Expense claim retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');
      
      const expense = await expenseService.updateExpense(req.params.id as string, req.body, employee._id.toString());
      res.status(200).json(ApiResponse.ok(expense, 'Expense claim updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateExpenseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, rejectionReason } = req.body;
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');

      const expense = await expenseService.updateExpenseStatus(req.params.id as string, status, employee._id.toString(), rejectionReason);
      res.status(200).json(ApiResponse.ok(expense, `Expense claim ${status.toLowerCase()} successfully`));
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeModel.findOne({ userId: req.user!.userId });
      if (!employee) throw ApiError.notFound('Employee profile not found');

      await expenseService.deleteExpense(req.params.id as string, employee._id.toString());
      res.status(200).json(ApiResponse.ok(null, 'Expense claim deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const expenseController = new ExpenseController();
