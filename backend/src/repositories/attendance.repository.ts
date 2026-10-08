import { Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IAttendance, AttendanceModel } from '../models/attendance.model';

export class AttendanceRepository extends BaseRepository<IAttendance> {
  constructor() {
    super(AttendanceModel);
  }

  async findByEmployeeAndDate(employeeId: string | Types.ObjectId, date: string): Promise<IAttendance | null> {
    return this.model
      .findOne({
        employeeId: new Types.ObjectId(employeeId),
        date,
        isDeleted: false,
      })
      .exec();
  }

  async getAttendanceHistory(
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ): Promise<{ records: IAttendance[]; total: number; stats: any }> {
    const query = { ...filter, isDeleted: false };
    const [records, total, statsResult] = await Promise.all([
      this.model
        .find(query)
        .populate({
          path: 'employeeId',
          select: 'empId firstName lastName department designation',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
      this.model.aggregate([
        { $match: query as any },
        {
          $group: {
            _id: null,
            presentDays: { $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'LATE']] }, 1, 0] } },
            lateDays: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
            halfDays: { $sum: { $cond: [{ $eq: ['$status', 'HALF_DAY'] }, 1, 0] } },
            totalMinutes: { $sum: { $ifNull: ['$workDurationMinutes', 0] } },
            totalOvertime: { $sum: { $ifNull: ['$overtimeMinutes', 0] } },
            totalShortfall: { $sum: { $ifNull: ['$shortfallMinutes', 0] } }
          }
        }
      ]).exec(),
    ]);

    const stats = statsResult[0] || { presentDays: 0, lateDays: 0, halfDays: 0, totalMinutes: 0, totalOvertime: 0, totalShortfall: 0 };
    return { records, total, stats };
  }
}
