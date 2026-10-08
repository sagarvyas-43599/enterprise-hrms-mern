import { Request, Response, NextFunction } from 'express';
import { PayrollService } from '../services/payroll.service';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import {
  GeneratePayrollInput,
  UpdatePayrollStatusInput,
  PayrollQueryParams,
} from '../validations/payroll.validation';

export class PayrollController {
  private payrollService: PayrollService;

  constructor() {
    this.payrollService = new PayrollService();
  }

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: GeneratePayrollInput = req.body;
      const result = await this.payrollService.generateSalarySlip(input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Salary slip generated successfully in DRAFT status'));
    } catch (error) {
      next(error);
    }
  };

  autoSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { employeeId, month, year } = req.body;
      const result = await this.payrollService.autoSyncPayrollFromAttendance(employeeId, Number(month), Number(year));

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Salary slip auto-generated from Attendance successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdatePayrollStatusInput = req.body;
      const result = await this.payrollService.updatePayrollStatus(id!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, `Payroll status updated to ${input.status}`));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as PayrollQueryParams;
      const result = await this.payrollService.getPayrolls(query, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result.payrolls, 'Payroll records retrieved successfully', result.meta));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.payrollService.getPayrollById(id!, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Salary slip details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = req.query.month ? Number(req.query.month) : undefined;
      const year = req.query.year ? Number(req.query.year) : undefined;
      const result = await this.payrollService.getPayrollAnalytics(month, year);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Payroll corporate expenditure analytics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
