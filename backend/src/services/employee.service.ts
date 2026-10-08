import { Types, FilterQuery } from 'mongoose';
import { EmployeeRepository } from '../repositories/employee.repository';
import { UserRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/apiResponse';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeesQueryParams,
} from '../validations/employee.validation';
import { AuthenticatedUser } from '../@types/express';
import { UserRole } from '../constants/enums';
import { IEmployee } from '../models/employee.model';

export class EmployeeService {
  private employeeRepo: EmployeeRepository;
  private userRepo: UserRepository;

  constructor() {
    this.employeeRepo = new EmployeeRepository();
    this.userRepo = new UserRepository();
  }

  async createEmployee(input: CreateEmployeeInput) {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict(`An account with email '${input.email}' already exists.`);
    }

    const existingEmp = await this.employeeRepo.findByEmpId(input.empId);
    if (existingEmp) {
      throw ApiError.conflict(`Employee ID '${input.empId}' already exists.`);
    }

    if (input.reportingManagerId) {
      const manager = await this.employeeRepo.findById(input.reportingManagerId);
      if (!manager) {
        throw ApiError.notFound(`Reporting Manager with ID '${input.reportingManagerId}' does not exist.`);
      }
    }

    // 1. Create User
    const user = await this.userRepo.create({
      email: input.email.toLowerCase().trim(),
      passwordHash: input.password,
      role: input.role,
      isActive: true,
      isDeleted: false,
    });

    // 2. Create Employee
    const employee = await this.employeeRepo.create({
      userId: user._id,
      empId: input.empId.toUpperCase().trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      department: input.department.trim(),
      designation: input.designation.trim(),
      reportingManagerId: input.reportingManagerId
        ? new Types.ObjectId(input.reportingManagerId)
        : null,
      profileImage: input.profileImage || '',
      phone: input.phone,
      joinedAt: input.joinedAt ? new Date(input.joinedAt) : new Date(),
      isDeleted: false,
    });

    return this.employeeRepo.findByIdWithDetails(employee._id);
  }

  async getAllEmployees(query: EmployeesQueryParams, user: AuthenticatedUser, excludeUserId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IEmployee> = {};

    if (user.role === UserRole.MANAGER && user.employeeId) {
      filter.$or = [
        { reportingManagerId: new Types.ObjectId(user.employeeId) },
        { _id: new Types.ObjectId(user.employeeId) }
      ];
    }

    if (query.department) {
      filter.department = { $regex: new RegExp(query.department, 'i') };
    }

    if (query.designation) {
      filter.designation = { $regex: new RegExp(query.designation, 'i') };
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      
      // Look up users by email first to support email search
      const matchingUsers = await this.userRepo.find({ email: searchRegex });
      const matchingUserIds = matchingUsers.map((u) => u._id);

      const searchOr: any[] = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { empId: searchRegex },
        { phone: searchRegex },
      ];
      
      if (matchingUserIds.length > 0) {
        searchOr.push({ userId: { $in: matchingUserIds } } as any);
      }

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchOr }
        ];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    if (query.status || query.role) {
      const userFilter: any = {};
      if (query.status) {
        userFilter.isActive = query.status === 'ACTIVE';
      }
      if (query.role) {
        userFilter.role = query.role;
      }
      const matchedUsers = await this.userRepo.find(userFilter);
      const matchedUserIds = matchedUsers.map((u) => u._id);
      
      filter.userId = { $in: matchedUserIds };
    }

    if (excludeUserId) {
      filter.userId = { 
        ...((filter.userId as any) || {}), 
        $ne: new Types.ObjectId(excludeUserId) 
      } as any;
    }

    const { employees, total } = await this.employeeRepo.findWithFilters(filter, skip, limit);

    return {
      employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id: string) {
    const employee = await this.employeeRepo.findByIdWithDetails(id);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${id}`);
    }

    const directReports = await this.employeeRepo.findDirectReports(employee._id);

    return {
      ...employee.toObject(),
      directReports,
    };
  }

  async updateEmployee(id: string, input: UpdateEmployeeInput) {
    let employee = null;
    if (Types.ObjectId.isValid(id)) {
      employee = await this.employeeRepo.findById(id);
    }
    if (!employee) {
      employee = await this.employeeRepo.findByEmpId(id);
    }
    if (!employee && Types.ObjectId.isValid(id)) {
      employee = await this.employeeRepo.findByUserId(id);
    }
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${id}`);
    }

    if (input.reportingManagerId) {
      if (input.reportingManagerId === id) {
        throw ApiError.badRequest('An employee cannot be their own reporting manager.');
      }
      const manager = await this.employeeRepo.findById(input.reportingManagerId);
      if (!manager) {
        throw ApiError.notFound(`Reporting Manager with ID '${input.reportingManagerId}' does not exist.`);
      }
    }

    // If isActive toggle is provided, update associated user status
    if (typeof input.isActive === 'boolean') {
      await this.userRepo.updateById(employee.userId, { isActive: input.isActive });
    }

    const updatePayload: Partial<IEmployee> = {};
    if (input.firstName) updatePayload.firstName = input.firstName.trim();
    if (input.lastName) updatePayload.lastName = input.lastName.trim();
    if (input.department) updatePayload.department = input.department.trim();
    if (input.designation) updatePayload.designation = input.designation.trim();
    if (input.profileImage !== undefined) updatePayload.profileImage = input.profileImage.trim();
    if (input.phone !== undefined) updatePayload.phone = input.phone;
    if (input.reportingManagerId !== undefined) {
      updatePayload.reportingManagerId = input.reportingManagerId
        ? new Types.ObjectId(input.reportingManagerId)
        : null;
    }

    await this.employeeRepo.updateById(employee._id, updatePayload);
    return this.employeeRepo.findByIdWithDetails(employee._id);
  }

  async deleteEmployee(id: string) {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${id}`);
    }

    // Soft delete employee profile
    await this.employeeRepo.softDelete(id);

    // Soft delete associated user credentials
    await this.userRepo.softDelete(employee.userId);

    return { message: `Employee '${employee.empId}' (${employee.firstName} ${employee.lastName}) soft deleted successfully.` };
  }

  async getOrgChart(employeeId?: string) {
    if (employeeId) {
      const employee = await this.employeeRepo.findById(employeeId);
      if (!employee) throw ApiError.notFound('Employee not found');
      const directReports = await this.employeeRepo.findDirectReports(employeeId);
      return { employee, directReports };
    }

    // Top level leaders (reportingManagerId: null)
    const topLevelLeaders = await this.employeeRepo.find({ reportingManagerId: null });
    return { topLevelLeaders };
  }

  async getDepartmentStats() {
    return this.employeeRepo.getDepartmentStats();
  }
}
