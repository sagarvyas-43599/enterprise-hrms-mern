import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { HttpStatusCode, UserRole } from '../constants/enums';
import { ClockInInput, ClockOutInput, AttendanceQueryParams, RegularizeInput } from '../validations/attendance.validation';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  clockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const input: ClockInInput = req.body;

      const employeeId = input.employeeId || req.user?.employeeId;
      if (!employeeId) {
        throw ApiError.badRequest('Employee ID is required or user must have an associated employee record');
      }

      const result = await this.attendanceService.clockIn({ ...input, employeeId }, clientIp);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Clock-in recorded successfully'));
    } catch (error) {
      next(error);
    }
  };

  clockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: ClockOutInput = req.body;

      const employeeId = input.employeeId || req.user?.employeeId;
      if (!employeeId) {
        throw ApiError.badRequest('Employee ID is required or user must have an associated employee record');
      }

      const result = await this.attendanceService.clockOut({ ...input, employeeId });

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Clock-out recorded successfully'));
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = { ...(req.query as unknown as AttendanceQueryParams) };
      const result = await this.attendanceService.getAttendanceHistory(query, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Attendance history retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  regularize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: RegularizeInput = req.body;
      const result = await this.attendanceService.regularizeAttendance(input);
      res.status(HttpStatusCode.OK).json(ApiResponse.ok(result, 'Attendance regularized successfully'));
    } catch (error) {
      next(error);
    }
  };
}
