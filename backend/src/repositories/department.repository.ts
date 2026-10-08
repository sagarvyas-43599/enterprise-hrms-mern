import { Types, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IDepartment, IDesignation, DepartmentModel, DesignationModel } from '../models/department.model';

export class DepartmentRepository extends BaseRepository<IDepartment> {
  constructor() {
    super(DepartmentModel);
  }

  async findByCode(code: string): Promise<IDepartment | null> {
    return this.model.findOne({ code: code.toUpperCase().trim(), isDeleted: false }).exec();
  }

  async findByName(name: string): Promise<IDepartment | null> {
    return this.model.findOne({ name: name.trim(), isDeleted: false }).exec();
  }

  async findWithDetails(filter: FilterQuery<IDepartment> = {}): Promise<IDepartment[]> {
    return this.model
      .find({ ...filter, isDeleted: false })
      .populate({
        path: 'headOfDepartmentId',
        select: 'empId firstName lastName designation phone',
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}

export class DesignationRepository extends BaseRepository<IDesignation> {
  constructor() {
    super(DesignationModel);
  }

  async findByCode(code: string): Promise<IDesignation | null> {
    return this.model.findOne({ code: code.toUpperCase().trim(), isDeleted: false }).exec();
  }

  async findWithDetails(filter: FilterQuery<IDesignation> = {}): Promise<IDesignation[]> {
    return this.model
      .find({ ...filter, isDeleted: false })
      .populate({
        path: 'departmentId',
        select: 'code name',
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
