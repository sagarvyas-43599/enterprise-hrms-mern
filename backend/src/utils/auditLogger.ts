import { Request } from 'express';
import { Types } from 'mongoose';
import { AuditLogModel } from '../models/auditLog.model';
import { logger } from './logger';

export interface AuditEventParams {
  actorId?: string | Types.ObjectId;
  actorEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  req?: Request;
  details?: Record<string, unknown>;
}

export const logAuditEvent = (params: AuditEventParams): void => {
  // Execute non-blocking so it never slows down critical path APIs
  setImmediate(async () => {
    try {
      let ipAddress = 'unknown';
      let userAgent = 'unknown';

      if (params.req) {
        ipAddress =
          (params.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
          params.req.socket.remoteAddress ||
          '127.0.0.1';
        
        // Handle IPv6 localhost
        if (ipAddress === '::1') ipAddress = '127.0.0.1';

        userAgent = params.req.headers['user-agent'] || 'Unknown Device';
      }

      await AuditLogModel.create({
        actorId: params.actorId ? new Types.ObjectId(params.actorId) : null,
        actorEmail: params.actorEmail,
        action: params.action.toUpperCase(),
        entity: params.entity.toUpperCase(),
        entityId: params.entityId,
        ipAddress,
        userAgent,
        details: params.details || {},
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`[AUDIT_LOG_FAILURE] Could not write audit trail: ${(error as Error).message}`);
    }
  });
};
