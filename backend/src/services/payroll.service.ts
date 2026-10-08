import { Types, FilterQuery } from 'mongoose';
import { PayrollRepository } from '../repositories/payroll.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { ApiError } from '../utils/apiResponse';
import { PayrollStatus, UserRole } from '../constants/enums';
import {
  GeneratePayrollInput,
  UpdatePayrollStatusInput,
  PayrollQueryParams,
} from '../validations/payroll.validation';
import { AuthenticatedUser } from '../@types/express';
import { IPayroll } from '../models/payroll.model';
import { EmployeeModel } from '../models/employee.model';

export class PayrollService {
  private payrollRepo: PayrollRepository;
  private employeeRepo: EmployeeRepository;
  private attendanceRepo: AttendanceRepository;

  constructor() {
    this.payrollRepo = new PayrollRepository();
    this.employeeRepo = new EmployeeRepository();
    this.attendanceRepo = new AttendanceRepository();
  }

  async generateSalarySlip(input: GeneratePayrollInput) {
    const employee = await this.employeeRepo.findById(input.employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${input.employeeId}`);
    }

    // Prevent duplicate salary slip for same month and year
    const existing = await this.payrollRepo.findByEmployeeMonthYear(
      input.employeeId,
      input.month,
      input.year
    );

    if (existing) {
      throw ApiError.conflict(
        `A salary slip for employee '${employee.empId}' for ${input.month}/${input.year} already exists with status '${existing.status}'.`
      );
    }

    const totalAllowances = input.allowances.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = input.deductions.reduce((sum, item) => sum + item.amount, 0);
    const netSalary = Math.max(0, input.baseSalary + totalAllowances - totalDeductions);

    const payroll = await this.payrollRepo.create({
      employeeId: new Types.ObjectId(input.employeeId),
      month: input.month,
      year: input.year,
      baseSalary: input.baseSalary,
      allowances: input.allowances,
      deductions: input.deductions,
      totalAllowances,
      totalDeductions,
      netSalary,
      status: PayrollStatus.DRAFT,
      isDeleted: false,
    });

    return payroll;
  }

  async autoSyncPayrollFromAttendance(employeeId: string, month: number, year: number) {
    const employee = await this.employeeRepo.findById(employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${employeeId}`);
    }

    // Get first and last day of the month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { stats } = await this.attendanceRepo.getAttendanceHistory(
      {
        employeeId: new Types.ObjectId(employeeId),
        date: { $gte: startDate, $lte: endDate },
      },
      0,
      31
    );

    const baseSalary = employee.baseSalary || 50000;
    const hourlyRate = baseSalary / (22 * 9); // approx 22 working days, 9 hours per day
    const perMinuteRate = hourlyRate / 60;

    const allowances = [];
    const deductions = [];

    // Calculate Overtime Allowance
    if (stats.totalOvertime && stats.totalOvertime > 0) {
      const overtimeAmount = Math.round(stats.totalOvertime * perMinuteRate * 1.5); // 1.5x Overtime Pay
      allowances.push({
        title: `Overtime Pay (${(stats.totalOvertime / 60).toFixed(1)} hrs)`,
        amount: overtimeAmount,
      });
    }

    // Calculate Shortfall/Late Penalties
    if (stats.totalShortfall && stats.totalShortfall > 0) {
      const shortfallAmount = Math.round(stats.totalShortfall * perMinuteRate);
      deductions.push({
        title: `Shortfall/Late Deduction (${(stats.totalShortfall / 60).toFixed(1)} hrs)`,
        amount: shortfallAmount,
      });
    }

    return this.generateSalarySlip({
      employeeId,
      month,
      year,
      baseSalary,
      allowances,
      deductions,
    });
  }

  async updatePayrollStatus(id: string, input: UpdatePayrollStatusInput) {
    const payroll = await this.payrollRepo.findById(id);
    if (!payroll) {
      throw ApiError.notFound(`Payroll record not found with ID: ${id}`);
    }

    if (payroll.status === PayrollStatus.PAID) {
      throw ApiError.badRequest('Enterprise Rule Violation: Cannot modify an already PAID payroll record.');
    }

    if (payroll.status === PayrollStatus.PROCESSED && input.status === PayrollStatus.DRAFT) {
      throw ApiError.badRequest('Enterprise Rule Violation: Cannot move a PROCESSED payroll back to DRAFT.');
    }

    const updatePayload: Partial<IPayroll> = {
      status: input.status,
    };

    if (input.status === PayrollStatus.PAID) {
      updatePayload.paymentDate = input.paymentDate ? new Date(input.paymentDate) : new Date();
      if (input.transactionRef) updatePayload.transactionRef = input.transactionRef.trim();
    }

    const updated = await this.payrollRepo.updateById(id, updatePayload);
    return updated;
  }

  async getPayrolls(query: PayrollQueryParams, user: AuthenticatedUser) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IPayroll> = {};

    // Data isolation: Employees can only view their own payslips
    if (user.role === UserRole.EMPLOYEE) {
      if (!user.employeeId) {
        throw ApiError.forbidden('No linked employee profile found');
      }
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

    if (query.month) filter.month = query.month;
    if (query.year) filter.year = query.year;
    if (query.status) filter.status = query.status;

    const { payrolls, total } = await this.payrollRepo.findPayrollsWithDetails(filter, skip, limit);

    return {
      payrolls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPayrollById(id: string, user: AuthenticatedUser) {
    const payroll = await this.payrollRepo.findById(id);
    if (!payroll) {
      throw ApiError.notFound('Payroll record not found');
    }

    // Role check: Employee can only see their own payslip
    if (user.role === UserRole.EMPLOYEE && payroll.employeeId.toString() !== user.employeeId) {
      throw ApiError.forbidden('Access denied to other employee payslips');
    }

    const employee = await this.employeeRepo.findById(payroll.employeeId);

    return {
      ...payroll.toObject(),
      employee,
    };
  }

  async getPayrollAnalytics(month?: number, year?: number) {
    return this.payrollRepo.getMonthlyAnalytics(month, year);
  }
}
