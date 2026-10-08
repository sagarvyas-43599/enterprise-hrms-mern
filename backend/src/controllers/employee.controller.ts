import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeesQueryParams,
} from '../validations/employee.validation';

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateEmployeeInput = req.body;
      const result = await this.employeeService.createEmployee(input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Employee profile onboarded successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as EmployeesQueryParams & { includeSelf?: boolean };
      const excludeUserId = query.includeSelf ? undefined : req.user?.userId;
      const result = await this.employeeService.getAllEmployees(query, req.user!, excludeUserId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result.employees, 'Employees list retrieved successfully', result.meta));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.employeeService.getEmployeeById(id!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Employee profile details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateEmployeeInput = req.body;
      const targetId =
        id === 'me' || id === 'undefined' || !id
          ? (req.user?.employeeId || req.user?.userId)
          : id;
      const result = await this.employeeService.updateEmployee(targetId!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Employee profile updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.employeeService.deleteEmployee(id!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Employee soft-deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  getOrgChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = req.query.employeeId as string | undefined;
      const result = await this.employeeService.getOrgChart(employeeId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Organization hierarchy retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.employeeService.getDepartmentStats();

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Department headcount metrics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
