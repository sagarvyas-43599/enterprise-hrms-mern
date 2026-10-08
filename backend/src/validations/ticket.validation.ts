import { z } from 'zod';
import { TicketCategory, TicketPriority, TicketStatus } from '../constants/enums';

export const createTicketSchema = z.object({
  body: z.object({
    category: z.nativeEnum(TicketCategory, {
      errorMap: () => ({ message: 'Invalid ticket category. Options: IT_SUPPORT, PAYROLL_QUERY, HR_POLICY, FACILITIES_ADMIN, GENERAL' }),
    }),
    priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
    subject: z.string({ required_error: 'Ticket subject is required' }).min(5).max(200).trim(),
    description: z.string({ required_error: 'Detailed description is required' }).min(10).trim(),
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Ticket ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(TicketStatus),
    assignedTo: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Employee ID for assignee')
      .optional()
      .nullable(),
    resolutionNotes: z.string().max(1000).optional(),
  }),
});

export const addTicketMessageSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Ticket ID format'),
  }),
  body: z.object({
    message: z.string({ required_error: 'Message text is required' }).min(1).max(2000).trim(),
  }),
});

export const getTicketsQuerySchema = z.object({
  query: z.object({
    category: z.nativeEnum(TicketCategory).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    status: z.nativeEnum(TicketStatus).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const ticketIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Ticket ID format'),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>['body'];
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>['body'];
export type AddTicketMessageInput = z.infer<typeof addTicketMessageSchema>['body'];
export type TicketsQueryParams = z.infer<typeof getTicketsQuerySchema>['query'];
