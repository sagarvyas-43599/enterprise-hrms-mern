import { Types, FilterQuery } from 'mongoose';
import { LeaveRepository } from '../repositories/leave.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { ApiError } from '../utils/apiResponse';
import { LeaveStatus, LeaveType, UserRole } from '../constants/enums';
import { ApplyLeaveInput, ReviewLeaveInput, LeavesQueryParams } from '../validations/leave.validation';
import { AuthenticatedUser } from '../@types/express';
import { ILeave, LeaveModel } from '../models/leave.model';
import { EmployeeModel } from '../models/employee.model';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus } from '../constants/enums';
import { NotificationModel, NotificationType, NotificationPriority } from '../models/notification.model';

export const ENTERPRISE_ANNUAL_LEAVE_QUOTAS: Record<LeaveType, number> = {
  [LeaveType.CASUAL]: 12,
  [LeaveType.SICK]: 12,
  [LeaveType.MATERNITY]: 180,
  [LeaveType.PATERNITY]: 15,
  [LeaveType.UNPAID]: 365,
};

export class LeaveService {
  private leaveRepo: LeaveRepository;
  private employeeRepo: EmployeeRepository;
  private attendanceService: AttendanceService;

  constructor() {
    this.leaveRepo = new LeaveRepository();
    this.employeeRepo = new EmployeeRepository();
    this.attendanceService = new AttendanceService();
  }

  async applyLeave(employeeId: string, input: ApplyLeaveInput) {
    const employee = await this.employeeRepo.findById(employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${employeeId}`);
    }

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    // Calculate inclusive calendar day count (skipping weekends)
    let daysCount = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        daysCount++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (input.isHalfDay && daysCount === 1) {
      daysCount = 0.5;
    }

    // ENTERPRISE FEATURE: Check available leave balance (Quota Enforcement)
    const approvedLeaves = await LeaveModel.find({
      employeeId: new Types.ObjectId(employeeId),
      leaveType: input.leaveType,
      approvalStatus: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
      isDeleted: false
    }).lean();
    
    const usedDays = approvedLeaves.reduce((sum, l) => sum + (l.daysCount || 0), 0);
    const quota = ENTERPRISE_ANNUAL_LEAVE_QUOTAS[input.leaveType];
    
    if (usedDays + daysCount > quota && input.leaveType !== LeaveType.UNPAID) {
      throw ApiError.badRequest(
        `Insufficient ${input.leaveType} balance. Quota: ${quota}, Used/Pending: ${usedDays}. You requested ${daysCount} day(s).`
      );
    }

    // Check for overlapping pending or approved leaves
    const overlap = await this.leaveRepo.findOverlappingLeave(employeeId, start, end);
    if (overlap) {
      throw ApiError.conflict(
        `Leave request intersects with an existing ${overlap.approvalStatus} leave from ${overlap.startDate.toISOString().split('T')[0]} to ${overlap.endDate.toISOString().split('T')[0]}`
      );
    }

    // Auto-route to employee's reporting manager if assigned
    const approverId = employee.reportingManagerId || null;

    const leave = await this.leaveRepo.create({
      employeeId: new Types.ObjectId(employeeId),
      leaveType: input.leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      isHalfDay: input.isHalfDay || false,
      reason: input.reason,
      approvalStatus: LeaveStatus.PENDING,
      approverId,
      isDeleted: false,
    });

    // Notify approver or HR management
    try {
      await NotificationModel.create({
        recipientId: approverId || null,
        title: `New Leave Request Pending Review`,
        message: `An employee submitted a ${input.leaveType} leave request for ${daysCount} day(s). Reason: ${input.reason}`,
        type: NotificationType.LEAVE_UPDATE,
        priority: NotificationPriority.MEDIUM,
        actionLink: '/leaves',
      });
    } catch (notifErr) {
      console.error('Failed to dispatch leave application notification:', notifErr);
    }

    return leave;
  }

  async reviewLeave(
    leaveId: string,
    reviewer: AuthenticatedUser,
    input: ReviewLeaveInput
  ) {
    const leave = await this.leaveRepo.findById(leaveId);
    if (!leave) {
      throw ApiError.notFound(`Leave request not found with ID: ${leaveId}`);
    }

    if (leave.approvalStatus !== LeaveStatus.PENDING) {
      throw ApiError.badRequest(
        `Leave request has already been processed with status '${leave.approvalStatus}'`
      );
    }

    // Managers can only review leaves assigned to them
    if (reviewer.role === UserRole.MANAGER) {
      if (!leave.approverId || leave.approverId.toString() !== reviewer.employeeId) {
        throw ApiError.forbidden('You are only authorized to review leave requests for your direct reports.');
      }
    }

    const updated = await this.leaveRepo.updateById(leaveId, {
      approvalStatus: input.status,
      approvalRemarks: input.remarks || undefined,
      approverId: reviewer.employeeId ? new Types.ObjectId(reviewer.employeeId) : leave.approverId,
    });

    // SYNC WITH ATTENDANCE MODULE
    if (input.status === LeaveStatus.APPROVED && updated) {
      const cur = new Date(updated.startDate);
      const end = new Date(updated.endDate);

      while (cur <= end) {
        const day = cur.getDay();
        // Skip weekends
        if (day !== 0 && day !== 6) {
          const dateStr = cur.toISOString().split('T')[0] as string;
          try {
            await this.attendanceService.regularizeAttendance({
              employeeId: updated.employeeId.toString(),
              date: dateStr,
              clockIn: cur.toISOString(), // Placeholder
              clockOut: null,
              status: updated.isHalfDay ? AttendanceStatus.HALF_DAY : AttendanceStatus.ON_LEAVE,
              remarks: `Leave Approved: ${updated.leaveType}`,
            });
          } catch (err) {
            console.error('Failed to sync leave to attendance for date:', dateStr, err);
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Dispatch notification to employee
    try {
      if (updated) {
        await NotificationModel.create({
          recipientId: updated.employeeId,
          title: `Leave Request ${input.status}`,
          message: `Your ${updated.leaveType} leave application has been ${input.status.toLowerCase()} by management.${input.remarks ? ` Remarks: ${input.remarks}` : ''}`,
          type: NotificationType.LEAVE_UPDATE,
          priority: input.status === LeaveStatus.REJECTED ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
          actionLink: '/leaves',
        });
      }
    } catch (notifErr) {
      console.error('Failed to dispatch leave review notification:', notifErr);
    }

    return updated;
  }

  async cancelLeave(leaveId: string, employeeId: string) {
    const leave = await this.leaveRepo.findById(leaveId);
    if (!leave) {
      throw ApiError.notFound('Leave request not found');
    }

    if (leave.employeeId.toString() !== employeeId) {
      throw ApiError.forbidden('You can only cancel your own leave requests.');
    }

    if (leave.approvalStatus !== LeaveStatus.PENDING) {
      throw ApiError.badRequest('Only pending leave requests can be cancelled.');
    }

    return this.leaveRepo.updateById(leaveId, {
      approvalStatus: LeaveStatus.CANCELLED,
    });
  }

  async getLeaves(query: LeavesQueryParams, user: AuthenticatedUser) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ILeave> = {};

    // Data isolation: Employees can only view their own leave requests
    if (user.role === UserRole.EMPLOYEE) {
      if (!user.employeeId) throw ApiError.forbidden('No linked employee profile found');
      filter.employeeId = new Types.ObjectId(user.employeeId);
    } else if (user.role === UserRole.MANAGER && user.employeeId) {
      const managedEmployees = await EmployeeModel.find({ reportingManagerId: new Types.ObjectId(user.employeeId) }).select('_id').lean();
      const managedIds = managedEmployees.map(e => e._id);
      managedIds.push(new Types.ObjectId(user.employeeId));
      filter.employeeId = { $in: managedIds } as any;
    } else if (query.employeeId) {
      filter.employeeId = new Types.ObjectId(query.employeeId);
    } else if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      const matchedEmployees = await EmployeeModel.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { empId: searchRegex }
        ],
        isDeleted: false
      }).lean();
      
      const matchedEmployeeIds = matchedEmployees.map(e => e._id);
      filter.employeeId = { $in: matchedEmployeeIds } as any;
    }

    if (query.status) {
      filter.approvalStatus = query.status;
    }

    if (query.leaveType) {
      filter.leaveType = query.leaveType;
    }

    if (query.startDate || query.endDate) {
      if (query.startDate) filter.startDate = { $gte: new Date(query.startDate) };
      if (query.endDate) filter.endDate = { $lte: new Date(query.endDate) };
    }

    const { leaves, total } = await this.leaveRepo.findLeavesWithDetails(filter, skip, limit);

    return {
      leaves,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLeaveBalances(employeeId: string) {
    const currentYear = new Date().getFullYear();
    const stats = await this.leaveRepo.getYearlyLeaveStats(employeeId, currentYear);

    const usedMap = new Map<string, number>();
    stats.forEach((item) => usedMap.set(item._id, item.totalDays));

    const balanceBreakdown = Object.values(LeaveType).map((type) => {
      const quota = ENTERPRISE_ANNUAL_LEAVE_QUOTAS[type];
      const used = usedMap.get(type) || 0;
      const remaining = Math.max(0, quota - used);

      return {
        leaveType: type,
        annualQuota: quota,
        usedDays: used,
        remainingDays: remaining,
      };
    });

    return {
      year: currentYear,
      balances: balanceBreakdown,
    };
  }
}
