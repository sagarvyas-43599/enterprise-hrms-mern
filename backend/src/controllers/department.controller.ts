import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateDesignationInput,
  UpdateDesignationInput,
  DepartmentsQueryParams,
  DesignationsQueryParams,
} from '../validations/department.validation';

export class DepartmentController {
  private deptService: DepartmentService;

  constructor() {
    this.deptService = new DepartmentService();
  }

  // --- DEPARTMENTS ---

  createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateDepartmentInput = req.body;
      const result = await this.deptService.createDepartment(input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Department created successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateDepartmentInput = req.body;
      const result = await this.deptService.updateDepartment(id!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Department updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAllDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deptService.getAllDepartments(req.query as any as DepartmentsQueryParams);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Departments list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getDepartmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.deptService.getDepartmentById(id!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Department details and active staff retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.deptService.deleteDepartment(id!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Department deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // --- DESIGNATIONS ---

  createDesignation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateDesignationInput = req.body;
      const result = await this.deptService.createDesignation(input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Designation role created successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateDesignation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateDesignationInput = req.body;
      const result = await this.deptService.updateDesignation(id!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Designation role updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAllDesignations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deptService.getAllDesignations(req.query as any as DesignationsQueryParams);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Designations list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
