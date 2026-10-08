import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { HttpStatusCode } from '../constants/enums';
import {
  CreateTicketInput,
  UpdateTicketStatusInput,
  AddTicketMessageInput,
  TicketsQueryParams,
} from '../validations/ticket.validation';

export class TicketController {
  private ticketService: TicketService;

  constructor() {
    this.ticketService = new TicketService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateTicketInput = req.body;
      const employeeId = req.user?.employeeId;

      if (!employeeId) {
        throw ApiError.badRequest('No linked employee profile found to create a support ticket');
      }

      const result = await this.ticketService.createTicket(employeeId, input);

      res
        .status(HttpStatusCode.CREATED)
        .json(ApiResponse.created(result, 'Support ticket created successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateTicketStatusInput = req.body;
      const result = await this.ticketService.updateTicketStatus(id!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, `Ticket status updated to ${input.status}`));
    } catch (error) {
      next(error);
    }
  };

  addMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const input: AddTicketMessageInput = req.body;
      const result = await this.ticketService.addMessage(id!, req.user!, input);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Message posted to ticket conversation'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as TicketsQueryParams;
      const result = await this.ticketService.getTickets(query, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result.tickets, 'Tickets list retrieved successfully', result.meta));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.ticketService.getTicketById(id!, req.user!);

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Ticket details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.ticketService.getMetrics();

      res
        .status(HttpStatusCode.OK)
        .json(ApiResponse.ok(result, 'Helpdesk SLA performance metrics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
