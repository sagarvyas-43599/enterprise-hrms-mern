import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leave.service';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import { ApplyLeaveInput, ReviewLeaveInput, LeavesQueryParams } from '../validations/leave.validation';

export class LeaveController {
  private leaveService: LeaveService;

  constructor() {
    this.leaveService = new LeaveService();
  }

  apply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: ApplyLeaveInput = req.body;
      const employeeId = input.employeeId || req.user?.employeeId;

      if (!employeeId) {
        throw ApiError.badRequest('Employee ID is required or user must have an associated employee profile');
      }

      const result = await this.leaveService.applyLeave(employeeId, input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Leave application submitted successfully'));
    } catch (error) {
      next(error);
    }
  };

  review = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: ReviewLeaveInput = req.body;
      const result = await this.leaveService.reviewLeave(id!, req.user!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, `Leave request marked as ${input.status}`));
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        throw ApiError.badRequest('No linked employee profile found to cancel leave');
      }

      const result = await this.leaveService.cancelLeave(id!, employeeId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Leave request cancelled successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as LeavesQueryParams;
      const result = await this.leaveService.getLeaves(query, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result.leaves, 'Leave records retrieved successfully', result.meta));
    } catch (error) {
      next(error);
    }
  };

  getBalances = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = (req.query.employeeId as string) || req.user?.employeeId;
      if (!employeeId) {
        throw ApiError.badRequest('Employee ID is required to calculate leave balances');
      }

      const result = await this.leaveService.getLeaveBalances(employeeId);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Leave balance quota retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
