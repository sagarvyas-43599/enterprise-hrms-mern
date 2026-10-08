import { Request, Response, NextFunction } from 'express';
import { PerformanceService } from '../services/performance.service';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import {
  CreateGoalInput,
  UpdateGoalProgressInput,
  CreateAppraisalCycleInput,
  SubmitSelfReviewInput,
  SubmitManagerReviewInput,
  GoalsQueryParams,
  AppraisalsQueryParams,
} from '../validations/performance.validation';

export class PerformanceController {
  private performanceService: PerformanceService;

  constructor() {
    this.performanceService = new PerformanceService();
  }

  createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateGoalInput = req.body;
      const employeeId = input.employeeId || req.user?.employeeId;

      if (!employeeId) {
        throw ApiError.badRequest('Employee ID is required or user must have an associated employee profile');
      }

      const result = await this.performanceService.createGoal(employeeId, input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Performance goal created successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateGoalProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateGoalProgressInput = req.body;
      const result = await this.performanceService.updateGoalProgress(id!, req.user!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Goal progress updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GoalsQueryParams;
      const result = await this.performanceService.getGoals(query, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result.goals, 'Goals list retrieved successfully', result.meta));
    } catch (error) {
      next(error);
    }
  };

  getGoalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = (req.query.employeeId as string) || req.user?.employeeId;
      if (!employeeId) {
        throw ApiError.badRequest('Employee ID is required to calculate goal metrics');
      }

      const result = await this.performanceService.getGoalStats(employeeId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Goal completion metrics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  initiateAppraisal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateAppraisalCycleInput = req.body;
      const result = await this.performanceService.initiateAppraisal(input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Appraisal cycle initiated successfully'));
    } catch (error) {
      next(error);
    }
  };

  submitSelfReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: SubmitSelfReviewInput = req.body;
      const result = await this.performanceService.submitSelfReview(id!, req.user!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Self-appraisal review submitted successfully'));
    } catch (error) {
      next(error);
    }
  };

  submitManagerReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: SubmitManagerReviewInput = req.body;
      const result = await this.performanceService.submitManagerReview(id!, req.user!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Manager appraisal evaluation completed successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAppraisals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as AppraisalsQueryParams;
      const result = await this.performanceService.getAppraisals(query, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result.appraisals, 'Appraisals retrieved successfully', result.meta));
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
      const result = await this.performanceService.getPerformanceDistribution(year);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, `Performance rating distribution for ${year} retrieved successfully`));
    } catch (error) {
      next(error);
    }
  };
}
