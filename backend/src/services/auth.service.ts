import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { ApiError } from '../utils/apiResponse';
import { generateAuthTokens, verifyRefreshToken } from '../utils/token';
import { LoginInput, RegisterUserInput, ChangePasswordInput } from '../validations/auth.validation';
import { logAuditEvent } from '../utils/auditLogger';

export class AuthService {
  private userRepo: UserRepository;
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.employeeRepo = new EmployeeRepository();
  }

  async login(input: LoginInput) {
    const user = await this.userRepo.findByEmailWithPassword(input.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid corporate email or password credentials');
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid corporate email or password credentials');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Contact HR Administration.');
    }

    // Lookup associated employee record
    const employee = await this.employeeRepo.findByUserId(user._id.toString());

    // Update last login timestamp in background
    await this.userRepo.updateLastLogin(user._id);

    // Record immutable enterprise compliance audit trail
    logAuditEvent({
      actorId: user._id,
      actorEmail: user.email,
      action: 'AUTH_LOGIN',
      entity: 'USER',
      entityId: user._id.toString(),
      details: { role: user.role, empId: employee?.empId },
    });

    const tokens = generateAuthTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      employeeId: employee?._id?.toString(),
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      employee: employee
        ? {
            id: employee._id.toString(),
            _id: employee._id.toString(),
            empId: employee.empId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            department: employee.department,
            designation: employee.designation,
            phone: employee.phone,
            joinedAt: employee.joinedAt,
            profileImage: employee.profileImage,
          }
        : null,
      tokens,
    };
  }

  async register(input: RegisterUserInput) {
    // 1. Verify unique email
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict(`An account with email '${input.email}' already exists.`);
    }

    // 2. Verify unique employee ID
    const existingEmp = await this.employeeRepo.findByEmpId(input.empId);
    if (existingEmp) {
      throw ApiError.conflict(`Employee ID '${input.empId}' is already registered in the system.`);
    }

    // 3. Create user credentials
    const createdUser = await this.userRepo.create({
      email: input.email.toLowerCase().trim(),
      passwordHash: input.password, // hashed by mongoose pre-save hook
      role: input.role,
      isActive: true,
      isDeleted: false,
    });

    // 4. Create linked employee record
    const createdEmployee = await this.employeeRepo.create({
      userId: createdUser._id,
      empId: input.empId.toUpperCase().trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      department: input.department.trim(),
      designation: input.designation.trim(),
      reportingManagerId: input.reportingManagerId
        ? new Types.ObjectId(input.reportingManagerId)
        : null,
      phone: input.phone,
      joinedAt: input.joinedAt ? new Date(input.joinedAt) : new Date(),
      isDeleted: false,
    });

    const tokens = generateAuthTokens({
      userId: createdUser._id.toString(),
      email: createdUser.email,
      role: createdUser.role,
      employeeId: createdEmployee._id.toString(),
    });

    return {
      user: {
        id: createdUser._id,
        email: createdUser.email,
        role: createdUser.role,
      },
      employee: {
        id: createdEmployee._id,
        empId: createdEmployee.empId,
        firstName: createdEmployee.firstName,
        lastName: createdEmployee.lastName,
        department: createdEmployee.department,
        designation: createdEmployee.designation,
        reportingManagerId: createdEmployee.reportingManagerId,
        profileImage: createdEmployee.profileImage,
      },
      tokens,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    const employee = await this.employeeRepo.findByUserId(userId);

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      employee: employee
        ? {
            id: employee._id.toString(),
            _id: employee._id.toString(),
            empId: employee.empId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            department: employee.department,
            designation: employee.designation,
            phone: employee.phone,
            joinedAt: employee.joinedAt,
            profileImage: employee.profileImage,
          }
        : null,
    };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.userRepo.findByIdWithPassword(userId);
    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    const isMatch = await user.comparePassword(input.currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password provided is incorrect');
    }

    // Set new password (will trigger pre-save hashing)
    user.passwordHash = input.newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async refreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid session. Please authenticate again.');
    }

    const employee = await this.employeeRepo.findByUserId(user._id.toString());

    const tokens = generateAuthTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      employeeId: employee?._id?.toString(),
    });

    return { tokens };
  }
}
