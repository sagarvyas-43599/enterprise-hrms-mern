import { Types } from 'mongoose';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { ApiError } from '../utils/apiResponse';
import { AttendanceStatus, UserRole } from '../constants/enums';
import { UserModel } from '../models/user.model';
import { AuthenticatedUser } from '../@types/express';
import { ClockInInput, ClockOutInput, AttendanceQueryParams, RegularizeInput } from '../validations/attendance.validation';
import { IAttendance } from '../models/attendance.model';
import { EmployeeModel } from '../models/employee.model';

export class AttendanceService {
  private attendanceRepo: AttendanceRepository;
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.attendanceRepo = new AttendanceRepository();
    this.employeeRepo = new EmployeeRepository();
  }

  private getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0] as string; // 'YYYY-MM-DD'
  }

  // Haversine formula to calculate distance between two coordinates in meters
  private getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Radius of the earth in m
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  private calculateShiftMetrics(durationMinutes: number) {
    const STANDARD_SHIFT_MINUTES = 9 * 60; // 9 hours
    let overtimeMinutes = 0;
    let shortfallMinutes = 0;

    if (durationMinutes > STANDARD_SHIFT_MINUTES) {
      overtimeMinutes = durationMinutes - STANDARD_SHIFT_MINUTES;
    } else if (durationMinutes < STANDARD_SHIFT_MINUTES) {
      shortfallMinutes = STANDARD_SHIFT_MINUTES - durationMinutes;
    }

    return { overtimeMinutes, shortfallMinutes };
  }

  async clockIn(input: ClockInInput, ipAddress?: string): Promise<IAttendance> {
    if (!input.employeeId) {
      throw ApiError.badRequest('Employee ID is required for clock-in action');
    }

    const employee = await this.employeeRepo.findById(input.employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${input.employeeId}`);
    }

    // GEOFENCING VALIDATION
    const OFFICE_LAT = 28.6139; // e.g. New Delhi HQ
    const OFFICE_LON = 77.2090;
    const ALLOWED_RADIUS_METERS = 500;

    if (input.location?.latitude && input.location?.longitude) {
      const distance = this.getDistanceFromLatLonInMeters(
        OFFICE_LAT, 
        OFFICE_LON, 
        input.location.latitude, 
        input.location.longitude
      );
      
      const user = await UserModel.findById(employee.userId).lean();
      const isExemptRole = user ? ['SUPER_ADMIN', 'HR_ADMIN'].includes(user.role) : false;
      
      if (distance > ALLOWED_RADIUS_METERS && !isExemptRole) {
        // Bypassed for QA Testing purposes
        console.warn(`[QA Bypass] Geofence restriction: ${Math.round(distance)} meters away.`);
        // throw ApiError.forbidden(`Geofence restriction: You are ${Math.round(distance)} meters away from the office. Clock-in is only allowed within ${ALLOWED_RADIUS_METERS} meters.`);
      }
    } else {
      // Optional: enforce location requirement
      // throw ApiError.badRequest('Location access is required for Clock-in.');
    }

    const today = this.getCurrentDateString();

    const existingAttendance = await this.attendanceRepo.findByEmployeeAndDate(
      input.employeeId,
      today
    );

    if (existingAttendance) {
      if (existingAttendance.clockOut) {
        throw ApiError.conflict(
          `Shift Already Completed: You have already clocked in and clocked out today (${today}). Multiple shifts per day are not supported.`
        );
      } else {
        throw ApiError.conflict(
          `Employee already clocked in today (${today}) at ${existingAttendance.clockIn.toISOString()}`
        );
      }
    }

    const attendanceData: Partial<IAttendance> = {
      employeeId: new Types.ObjectId(input.employeeId),
      date: today,
      clockIn: new Date(),
      status: AttendanceStatus.PRESENT,
      location: input.location,
      ipAddress,
      remarks: input.remarks,
      workDurationMinutes: 0,
    };

    return this.attendanceRepo.create(attendanceData);
  }

  async clockOut(input: ClockOutInput): Promise<IAttendance> {
    if (!input.employeeId) {
      throw ApiError.badRequest('Employee ID is required for clock-out action');
    }

    const employee = await this.employeeRepo.findById(input.employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${input.employeeId}`);
    }

    const today = this.getCurrentDateString();
    const existingAttendance = await this.attendanceRepo.findByEmployeeAndDate(
      input.employeeId,
      today
    );

    if (!existingAttendance) {
      throw ApiError.badRequest(`No active clock-in found for employee today (${today}).`);
    }

    if (existingAttendance.clockOut) {
      throw ApiError.conflict(
        `Employee already clocked out today at ${existingAttendance.clockOut.toISOString()}`
      );
    }

    const clockOutTime = new Date();
    const durationMs = clockOutTime.getTime() - new Date(existingAttendance.clockIn).getTime();
    const workDurationMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));
    const { overtimeMinutes, shortfallMinutes } = this.calculateShiftMetrics(workDurationMinutes);

    const status =
      workDurationMinutes < 240 ? AttendanceStatus.HALF_DAY : AttendanceStatus.PRESENT;

    const updated = await this.attendanceRepo.updateById(existingAttendance._id, {
      clockOut: clockOutTime,
      workDurationMinutes,
      overtimeMinutes,
      shortfallMinutes,
      status,
      ...(input.remarks && { remarks: `${existingAttendance.remarks || ''} | Out: ${input.remarks}`.trim() }),
    });

    if (!updated) {
      throw ApiError.internal('Failed to update attendance clock-out.');
    }

    return updated;
  }

  async getAttendanceHistory(query: AttendanceQueryParams, user: AuthenticatedUser) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // RBAC: Data isolation
    if (user.role === UserRole.EMPLOYEE) {
      if (!user.employeeId) {
        throw ApiError.forbidden('No employee profile linked to your user account');
      }
      filter.employeeId = new Types.ObjectId(user.employeeId);
    } else if (user.role === UserRole.MANAGER && user.employeeId) {
      const matchedEmployees = await EmployeeModel.find({ reportingManagerId: new Types.ObjectId(user.employeeId) }).select('_id').lean();
      const matchedIds = matchedEmployees.map(e => e._id);
      matchedIds.push(new Types.ObjectId(user.employeeId));
      filter.employeeId = { $in: matchedIds };
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
      filter.employeeId = { $in: matchedEmployeeIds };
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) (filter.date as Record<string, string>).$gte = query.startDate;
      if (query.endDate) (filter.date as Record<string, string>).$lte = query.endDate;
    }

    const { records, total, stats } = await this.attendanceRepo.getAttendanceHistory(filter, skip, limit);

    return {
      records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats,
      },
    };
  }

  async regularizeAttendance(input: RegularizeInput) {
    const { employeeId, date, clockIn, clockOut, status, remarks } = input;
    
    let workDurationMinutes = 0;
    let overtimeMinutes = 0;
    let shortfallMinutes = 0;

    if (clockOut) {
      const inTime = new Date(clockIn);
      const outTime = new Date(clockOut);
      if (outTime <= inTime) {
        throw ApiError.badRequest('Clock-out time must be after clock-in time');
      }
      workDurationMinutes = Math.floor((outTime.getTime() - inTime.getTime()) / 60000);
      const metrics = this.calculateShiftMetrics(workDurationMinutes);
      overtimeMinutes = metrics.overtimeMinutes;
      shortfallMinutes = metrics.shortfallMinutes;
    }

    let attendance = await this.attendanceRepo.findByEmployeeAndDate(employeeId, date);
    
    if (attendance) {
      // Update existing
      attendance.clockIn = new Date(clockIn);
      if (clockOut) attendance.clockOut = new Date(clockOut);
      if (status) attendance.status = status;
      if (remarks) attendance.remarks = remarks;
      attendance.workDurationMinutes = workDurationMinutes;
      attendance.overtimeMinutes = overtimeMinutes;
      attendance.shortfallMinutes = shortfallMinutes;
      await attendance.save();
    } else {
      // Create new
      attendance = await this.attendanceRepo.create({
        employeeId: new Types.ObjectId(employeeId),
        date,
        clockIn: new Date(clockIn),
        clockOut: clockOut ? new Date(clockOut) : null,
        status: status || AttendanceStatus.PRESENT,
        remarks: remarks || 'Regularized by Admin',
        workDurationMinutes,
        overtimeMinutes,
        shortfallMinutes,
      });
    }

    return attendance;
  }
}
