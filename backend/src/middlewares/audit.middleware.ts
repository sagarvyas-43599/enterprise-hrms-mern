import { Request, Response, NextFunction } from 'express';
import { logAuditEvent } from '../utils/auditLogger';

/**
 * Express middleware to automatically log Audit events for mutating requests.
 */
export const autoAudit = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // We only care about successful mutating requests
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      return next();
    }

    // Hook into the 'finish' event to ensure the request actually succeeded
    res.on('finish', () => {
      // Only log if the request was successful (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let action = 'UNKNOWN';
        if (req.method === 'POST') action = 'CREATE';
        else if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
        else if (req.method === 'DELETE') action = 'DELETE';

        if (action !== 'UNKNOWN') {
          // req.user is populated by the auth.middleware
          const actorId = (req as any).user?._id || (req as any).user?.id;
          const actorEmail = (req as any).user?.email;
          const entityId = req.params.id || req.params.employeeId || req.params.ticketId || undefined;
          
          // Deduce entity from originalUrl (e.g., /api/v1/employees/123 -> EMPLOYEE)
          let entity = 'SYSTEM';
          try {
            const urlPath = req.originalUrl?.split('?')[0] || '';
            const parts = urlPath.split('/').filter(Boolean);
            const v1Index = parts.indexOf('v1');
            if (v1Index !== -1 && parts.length > v1Index + 1) {
              const rawEntity = parts[v1Index + 1]; // e.g., 'employees'
              if (rawEntity) {
                entity = rawEntity.endsWith('s') 
                  ? rawEntity.slice(0, -1).toUpperCase() 
                  : rawEntity.toUpperCase();
              }
            }
          } catch (e) {
            // fallback to SYSTEM
          }

          // Optional: Extract some details from body if needed, but keep it lightweight
          // We mask passwords and sensitive fields
          const safeBody = { ...req.body };
          delete safeBody.password;
          delete safeBody.token;

          logAuditEvent({
            actorId,
            actorEmail,
            action,
            entity,
            entityId,
            req,
            details: {
              method: req.method,
              url: req.originalUrl,
              bodyParams: Object.keys(safeBody).length > 0 ? Object.keys(safeBody) : undefined,
            },
          });
        }
      }
    });

    next();
  };
};
