import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { validate } from '../middlewares/validator.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { UserRole } from '../constants/enums';
import {
  createTicketSchema,
  updateTicketStatusSchema,
  addTicketMessageSchema,
  getTicketsQuerySchema,
  ticketIdParamSchema,
} from '../validations/ticket.validation';

const router = Router();
const controller = new TicketController();

// GET /api/v1/tickets/metrics - SLA summary metrics (Admin/HR)
router.get(
  '/metrics',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  controller.getMetrics
);

// POST /api/v1/tickets - Raise new ticket
router.post(
  '/',
  authenticate,
  validate(createTicketSchema),
  controller.create
);

// GET /api/v1/tickets - List tickets (Scoped to employee self, all for Admin/HR)
router.get(
  '/',
  authenticate,
  validate(getTicketsQuerySchema),
  controller.getAll
);

// GET /api/v1/tickets/:id - View ticket thread
router.get(
  '/:id',
  authenticate,
  validate(ticketIdParamSchema),
  controller.getById
);

// PATCH /api/v1/tickets/:id/status - Update ticket status & assignee (HR/Admin)
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(updateTicketStatusSchema),
  controller.updateStatus
);

// POST /api/v1/tickets/:id/messages - Post message to thread
router.post(
  '/:id/messages',
  authenticate,
  validate(addTicketMessageSchema),
  controller.addMessage
);

export default router;
