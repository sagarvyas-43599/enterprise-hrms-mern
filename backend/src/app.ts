import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.config';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { autoAudit } from './middlewares/audit.middleware';
import { ApiError, ApiResponse } from './utils/apiResponse';
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import payrollRoutes from './routes/payroll.routes';
import assetRoutes from './routes/asset.routes';
import ticketRoutes from './routes/ticket.routes';
import performanceRoutes from './routes/performance.routes';
import departmentRoutes from './routes/department.routes';
import policyRoutes from './routes/policy.routes';
import auditLogRoutes from './routes/auditLog.routes';
import reportRoutes from './routes/report.routes';
import settingRoutes from './routes/setting.routes';
import notificationRoutes from './routes/notification.routes';
import recruitmentRoutes from './routes/recruitment.routes';
import expenseRoutes from './routes/expense.routes';
import documentRoutes from './routes/document.routes';

export const createApp = (): Application => {
  const app = express();

  // 1. Security & Core Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 2. Logging Middleware
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // 3. Global Tier Rate Limiter
  app.use(globalLimiter);

  // 4. Health Check Endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json(
      ApiResponse.ok(
        {
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          environment: env.NODE_ENV,
          modules: {
            auth: 'operational',
            employees: 'operational',
            attendance: 'operational',
            leaves: 'operational',
            payroll: 'operational',
            assets: 'operational',
            tickets: 'operational',
            performance: 'operational',
            departments: 'operational',
            policies: 'operational',
            auditLogs: 'operational',
          },
        },
        'HRMS Core Backend Services Operational'
      )
    );
  });

  // 5. API Routes (v1 Versioning)
  app.use('/api/v1/auth', authRoutes);
  
  // Apply Auto-Audit to all authenticated routes below
  app.use('/api/v1', autoAudit());

  app.use('/api/v1/employees', employeeRoutes);
  app.use('/api/v1/departments', departmentRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/leaves', leaveRoutes);
  app.use('/api/v1/payroll', payrollRoutes);
  app.use('/api/v1/assets', assetRoutes);
  app.use('/api/v1/tickets', ticketRoutes);
  app.use('/api/v1/performance', performanceRoutes);
  app.use('/api/v1/policies', policyRoutes);
  app.use('/api/v1/audit-logs', auditLogRoutes);
  app.use('/api/v1/reports', reportRoutes);
  app.use('/api/v1/settings', settingRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/recruitment', recruitmentRoutes);
  app.use('/api/v1/expenses', expenseRoutes);
  app.use('/api/v1/documents', documentRoutes);

  // 6. Handle 404 Route Not Found
  app.use((req: Request, _res: Response, next) => {
    next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} not found`));
  });

  // 7. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
