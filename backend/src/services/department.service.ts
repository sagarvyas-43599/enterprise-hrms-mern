import { FilterQuery, Types } from 'mongoose';
import { DepartmentRepository, DesignationRepository } from '../repositories/department.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { ApiError } from '../utils/apiResponse';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateDesignationInput,
  UpdateDesignationInput,
  DepartmentsQueryParams,
  DesignationsQueryParams,
} from '../validations/department.validation';
import { IDepartment, IDesignation, DepartmentModel, DesignationModel } from '../models/department.model';

export class DepartmentService {
  private deptRepo: DepartmentRepository;
  private desgRepo: DesignationRepository;
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.deptRepo = new DepartmentRepository();
    this.desgRepo = new DesignationRepository();
    this.employeeRepo = new EmployeeRepository();
  }

  // --- DEPARTMENT METHODS ---

  async createDepartment(input: CreateDepartmentInput) {
    const existingCode = await this.deptRepo.findByCode(input.code);
    if (existingCode) {
      throw ApiError.conflict(`Department code '${input.code}' already exists.`);
    }

    const existingName = await this.deptRepo.findByName(input.name);
    if (existingName) {
      throw ApiError.conflict(`Department name '${input.name}' already exists.`);
    }

    if (input.headOfDepartmentId) {
      const hod = await this.employeeRepo.findById(input.headOfDepartmentId);
      if (!hod) throw ApiError.notFound(`HOD Employee not found: ${input.headOfDepartmentId}`);
    }

    const department = await this.deptRepo.create({
      code: input.code.toUpperCase().trim(),
      name: input.name.trim(),
      description: input.description?.trim(),
      headOfDepartmentId: input.headOfDepartmentId
        ? new Types.ObjectId(input.headOfDepartmentId)
        : null,
      annualBudget: input.annualBudget || 0,
      isActive: true,
      isDeleted: false,
    });

    return department;
  }

  async updateDepartment(id: string, input: UpdateDepartmentInput) {
    const department = await this.deptRepo.findById(id);
    if (!department) {
      throw ApiError.notFound(`Department not found with ID: ${id}`);
    }

    if (input.name && input.name !== department.name) {
      const existingName = await this.deptRepo.findByName(input.name);
      if (existingName) {
        throw ApiError.conflict(`Department name '${input.name}' already exists.`);
      }
    }

    if (input.headOfDepartmentId) {
      const hod = await this.employeeRepo.findById(input.headOfDepartmentId);
      if (!hod) throw ApiError.notFound(`HOD Employee not found: ${input.headOfDepartmentId}`);
    }

    const updatePayload: Partial<IDepartment> = {};
    if (input.name) updatePayload.name = input.name.trim();
    if (input.description !== undefined) updatePayload.description = input.description.trim();
    if (input.headOfDepartmentId !== undefined) {
      updatePayload.headOfDepartmentId = input.headOfDepartmentId
        ? new Types.ObjectId(input.headOfDepartmentId)
        : null;
    }
    if (input.annualBudget !== undefined) updatePayload.annualBudget = input.annualBudget;
    if (input.isActive !== undefined) updatePayload.isActive = input.isActive;

    const updated = await this.deptRepo.updateById(id, updatePayload);
    return updated;
  }

  async getAllDepartments(query: DepartmentsQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IDepartment> = { isDeleted: false };
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { code: searchRegex },
      ];
    }

    const [departments, total] = await Promise.all([
      DepartmentModel.find(filter)
        .populate('headOfDepartmentId', 'firstName lastName email empId designation phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      DepartmentModel.countDocuments(filter)
    ]);

    return {
      departments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getDepartmentById(id: string) {
    const department = await this.deptRepo.findById(id);
    if (!department) {
      throw ApiError.notFound(`Department not found with ID: ${id}`);
    }

    const employees = await this.employeeRepo.find({ department: department.name });
    return {
      ...department.toObject(),
      totalEmployees: employees.length,
      employees,
    };
  }

  async deleteDepartment(id: string) {
    const department = await this.deptRepo.findById(id);
    if (!department) {
      throw ApiError.notFound(`Department not found with ID: ${id}`);
    }

    // Enterprise safety check: cannot delete department if employees belong to it
    const activeStaff = await this.employeeRepo.count({ department: department.name });
    if (activeStaff > 0) {
      throw ApiError.conflict(
        `Cannot delete department '${department.name}'. ${activeStaff} active employees are currently assigned to it. Reassign employees before deletion.`
      );
    }

    await this.deptRepo.softDelete(id);
    return { message: `Department '${department.name}' soft-deleted successfully.` };
  }

  // --- DESIGNATION METHODS ---

  async createDesignation(input: CreateDesignationInput) {
    const existingCode = await this.desgRepo.findByCode(input.code);
    if (existingCode) {
      throw ApiError.conflict(`Designation code '${input.code}' already exists.`);
    }

    const department = await this.deptRepo.findById(input.departmentId);
    if (!department) {
      throw ApiError.notFound(`Department not found with ID: ${input.departmentId}`);
    }

    const designation = await this.desgRepo.create({
      code: input.code.toUpperCase().trim(),
      title: input.title.trim(),
      departmentId: new Types.ObjectId(input.departmentId),
      payGrade: input.payGrade.toUpperCase().trim(),
      minSalary: input.minSalary,
      maxSalary: input.maxSalary,
      description: input.description?.trim(),
      isActive: true,
      isDeleted: false,
    });

    return designation;
  }

  async updateDesignation(id: string, input: UpdateDesignationInput) {
    const designation = await this.desgRepo.findById(id);
    if (!designation) {
      throw ApiError.notFound(`Designation not found with ID: ${id}`);
    }

    const updatePayload: Partial<IDesignation> = {};
    if (input.title) updatePayload.title = input.title.trim();
    if (input.payGrade) updatePayload.payGrade = input.payGrade.toUpperCase().trim();
    if (input.minSalary !== undefined) updatePayload.minSalary = input.minSalary;
    if (input.maxSalary !== undefined) updatePayload.maxSalary = input.maxSalary;
    if (input.description !== undefined) updatePayload.description = input.description.trim();
    if (input.isActive !== undefined) updatePayload.isActive = input.isActive;

    const updated = await this.desgRepo.updateById(id, updatePayload);
    return updated;
  }

  async getAllDesignations(query: DesignationsQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IDesignation> = { isDeleted: false };
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.departmentId) filter.departmentId = new Types.ObjectId(query.departmentId);
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { code: searchRegex },
      ];
    }

    const [designations, total] = await Promise.all([
      DesignationModel.find(filter)
        .populate('departmentId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      DesignationModel.countDocuments(filter)
    ]);

    return {
      designations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
