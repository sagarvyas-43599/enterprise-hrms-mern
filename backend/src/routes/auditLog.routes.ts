import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import { AuditLogModel } from '../models/auditLog.model';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

// GET /api/v1/audit-logs/stats - Aggregate security metrics
router.get(
  '/stats',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [totalEvents, todayEvents, uniqueActors, actionsBreakdown] = await Promise.all([
        AuditLogModel.countDocuments().exec(),
        AuditLogModel.countDocuments({ timestamp: { $gte: startOfDay } }).exec(),
        AuditLogModel.distinct('actorEmail').exec(),
        AuditLogModel.aggregate([
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
      ]);

      res.status(200).json(
        ApiResponse.ok(
          {
            totalEvents,
            todayEvents,
            totalUniqueActors: uniqueActors.filter(Boolean).length,
            topActions: actionsBreakdown,
          },
          'Audit trail statistics retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/audit-logs - Compliance Audit Trail (Super Admin & HR Admin)
router.get(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
      const limit = req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : 20;
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {};
      if (req.query.action) filter.action = (req.query.action as string).toUpperCase();
      if (req.query.entity) filter.entity = (req.query.entity as string).toUpperCase();
      if (req.query.actorEmail) filter.actorEmail = req.query.actorEmail;

      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search as string, 'i');
        filter.$or = [
          { actorEmail: searchRegex },
          { action: searchRegex },
          { entity: searchRegex },
          { ipAddress: searchRegex },
        ];
      }

      const [logs, total] = await Promise.all([
        AuditLogModel.find(filter)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        AuditLogModel.countDocuments(filter).exec(),
      ]);

      res.status(200).json(
        ApiResponse.ok(logs, 'Audit trail logs retrieved successfully', {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        })
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
