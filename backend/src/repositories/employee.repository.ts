import { Types, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IEmployee, EmployeeModel } from '../models/employee.model';

export class EmployeeRepository extends BaseRepository<IEmployee> {
  constructor() {
    super(EmployeeModel);
  }

  async findByEmpId(empId: string): Promise<IEmployee | null> {
    return this.model.findOne({ empId: empId.toUpperCase(), isDeleted: false }).exec();
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<IEmployee | null> {
    return this.model
      .findOne({ userId, isDeleted: false })
      .populate({
        path: 'reportingManagerId',
        select: 'empId firstName lastName designation department',
      })
      .exec();
  }

  async findByIdWithDetails(id: string | Types.ObjectId): Promise<IEmployee | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .populate({
        path: 'userId',
        select: 'email role isActive lastLoginAt createdAt',
      })
      .populate({
        path: 'reportingManagerId',
        select: 'empId firstName lastName designation department',
      })
      .exec();
  }

  async findWithFilters(
    queryFilter: FilterQuery<IEmployee>,
    skip: number,
    limit: number
  ): Promise<{ employees: IEmployee[]; total: number }> {
    const finalFilter = { ...queryFilter, isDeleted: false };

    const [employees, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .populate({
          path: 'userId',
          select: 'email role isActive lastLoginAt',
        })
        .populate({
          path: 'reportingManagerId',
          select: 'empId firstName lastName designation department',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);

    return { employees, total };
  }

  async findDirectReports(managerId: string | Types.ObjectId): Promise<IEmployee[]> {
    return this.model
      .find({
        reportingManagerId: new Types.ObjectId(managerId),
        isDeleted: false,
      })
      .select('empId firstName lastName designation department phone joinedAt')
      .exec();
  }

  async getDepartmentStats(): Promise<Array<{ _id: string; count: number }>> {
    return this.model.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
  }
}
