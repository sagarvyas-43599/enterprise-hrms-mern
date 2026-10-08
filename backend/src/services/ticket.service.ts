import { Types, FilterQuery } from 'mongoose';
import { TicketRepository } from '../repositories/ticket.repository';
import { EmployeeRepository } from '../repositories/employee.repository';
import { ApiError } from '../utils/apiResponse';
import { TicketStatus, UserRole, TicketPriority, TicketCategory } from '../constants/enums';
import {
  CreateTicketInput,
  UpdateTicketStatusInput,
  AddTicketMessageInput,
  TicketsQueryParams,
} from '../validations/ticket.validation';
import { AuthenticatedUser } from '../@types/express';
import { ITicket } from '../models/ticket.model';
import { NotificationModel, NotificationType, NotificationPriority } from '../models/notification.model';
import { EmployeeModel } from '../models/employee.model';

export class TicketService {
  private ticketRepo: TicketRepository;
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.ticketRepo = new TicketRepository();
    this.employeeRepo = new EmployeeRepository();
  }

  async createTicket(employeeId: string, input: CreateTicketInput) {
    const employee = await this.employeeRepo.findById(employeeId);
    if (!employee) {
      throw ApiError.notFound(`Employee not found with ID: ${employeeId}`);
    }

    const ticketId = await this.ticketRepo.generateNextTicketId();

    const ticketPayload = {
      ticketId,
      employeeId: new Types.ObjectId(employeeId),
      category: input.category,
      priority: input.priority,
      status: TicketStatus.OPEN,
      subject: input.subject,
      description: input.description,
      assignedTo: null,
      conversations: [
        {
          senderId: new Types.ObjectId(employeeId),
          senderModel: 'Employee' as const,
          message: input.description,
          createdAt: new Date(),
        },
      ],
      isDeleted: false,
    };

    // Auto-assignment and SLA logic
    let dueDate = new Date();
    switch (input.priority) {
      case TicketPriority.URGENT:
        dueDate.setHours(dueDate.getHours() + 4);
        break;
      case TicketPriority.HIGH:
        dueDate.setHours(dueDate.getHours() + 24);
        break;
      case TicketPriority.MEDIUM:
        dueDate.setDate(dueDate.getDate() + 3);
        break;
      case TicketPriority.LOW:
      default:
        dueDate.setDate(dueDate.getDate() + 5);
        break;
    }
    (ticketPayload as any).dueDate = dueDate;

    // Auto assign based on category (Enterprise Feature)
    // We can query an employee from IT department for IT_SUPPORT etc.
    const departmentMap: Record<string, string> = {
      [TicketCategory.IT_SUPPORT]: 'IT',
      [TicketCategory.PAYROLL_QUERY]: 'Finance',
      [TicketCategory.HR_POLICY]: 'HR',
      [TicketCategory.FACILITIES_ADMIN]: 'Operations',
    };
    const deptName = departmentMap[input.category];
    if (deptName) {
      const assignee = await this.employeeRepo.findOne({ department: deptName });
      if (assignee) {
        (ticketPayload as any).assignedTo = assignee._id;
        (ticketPayload as any).status = TicketStatus.IN_PROGRESS;
      }
    }

    const ticket = await this.ticketRepo.create(ticketPayload);

    return ticket;
  }

  async updateTicketStatus(ticketId: string, input: UpdateTicketStatusInput) {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket) {
      throw ApiError.notFound(`Ticket not found with ID: ${ticketId}`);
    }

    const updatePayload: Partial<ITicket> = {
      status: input.status,
    };

    if (input.assignedTo !== undefined) {
      if (input.assignedTo) {
        const assignee = await this.employeeRepo.findById(input.assignedTo);
        if (!assignee) throw ApiError.notFound(`Assignee employee not found: ${input.assignedTo}`);
        updatePayload.assignedTo = new Types.ObjectId(input.assignedTo);
      } else {
        updatePayload.assignedTo = null;
      }
    }

    if (input.status === TicketStatus.RESOLVED || input.status === TicketStatus.CLOSED) {
      updatePayload.resolvedAt = new Date();
    }

    if (input.resolutionNotes) {
      updatePayload.resolutionNotes = input.resolutionNotes;
    }

    const updated = await this.ticketRepo.updateById(ticketId, updatePayload);

    if (updated && ticket.employeeId) {
      try {
        await NotificationModel.create({
          recipientId: ticket.employeeId,
          title: `Support Ticket #${ticket.ticketId} Updated`,
          message: input.status
            ? `Your ticket status was changed to ${input.status.replace('_', ' ')}.${input.resolutionNotes ? ` Resolution: ${input.resolutionNotes}` : ''}`
            : `Your support ticket #${ticket.ticketId} has been updated.`,
          type: NotificationType.TICKET_UPDATE,
          priority: NotificationPriority.MEDIUM,
          actionLink: '/tickets',
        });
      } catch (err) {
        console.error('Failed to dispatch ticket notification:', err);
      }
    }

    return updated;
  }

  async addMessage(
    ticketId: string,
    user: AuthenticatedUser,
    input: AddTicketMessageInput
  ) {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket) {
      throw ApiError.notFound(`Ticket not found with ID: ${ticketId}`);
    }

    // Role check: Normal employees can only respond to their own tickets
    if (user.role === UserRole.EMPLOYEE && ticket.employeeId.toString() !== user.employeeId) {
      throw ApiError.forbidden('You can only post messages to your own helpdesk tickets.');
    }

    const senderId = user.employeeId
      ? new Types.ObjectId(user.employeeId)
      : new Types.ObjectId(user.userId);
    const senderModel = user.employeeId ? 'Employee' : 'User';

    const updated = await this.ticketRepo.addMessage(ticketId, {
      senderId,
      senderModel,
      message: input.message,
      createdAt: new Date(),
    });

    // Auto re-open ticket if employee replies after resolution
    if (user.role === UserRole.EMPLOYEE && ticket.status === TicketStatus.RESOLVED) {
      await this.ticketRepo.updateById(ticketId, { status: TicketStatus.IN_PROGRESS });
    }

    return updated;
  }

  async getTickets(query: TicketsQueryParams, user: AuthenticatedUser) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ITicket> = {};

    // Data isolation: Normal employees only see their own tickets
    if (user.role === UserRole.EMPLOYEE) {
      if (!user.employeeId) throw ApiError.forbidden('No linked employee profile found');
      filter.employeeId = new Types.ObjectId(user.employeeId);
    } else if (query.employeeId) {
      filter.employeeId = new Types.ObjectId(query.employeeId);
    }

    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.priority) filter.priority = query.priority;
    if (query.assignedTo) filter.assignedTo = new Types.ObjectId(query.assignedTo);

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      
      let matchedEmployeeIds: Types.ObjectId[] = [];
      if (user.role !== UserRole.EMPLOYEE) {
        const matchedEmployees = await EmployeeModel.find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { empId: searchRegex }
          ],
          isDeleted: false
        }).lean();
        matchedEmployeeIds = matchedEmployees.map(e => e._id as Types.ObjectId);
      }

      filter.$or = [
        { subject: searchRegex },
        { ticketId: searchRegex },
        { description: searchRegex },
        ...(matchedEmployeeIds.length > 0 ? [{ employeeId: { $in: matchedEmployeeIds } as any }] : [])
      ];
    }

    const { tickets, total } = await this.ticketRepo.findTicketsWithDetails(filter, skip, limit);

    return {
      tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketById(ticketId: string, user: AuthenticatedUser) {
    const ticket = await this.ticketRepo.findByIdWithDetails(ticketId);
    if (!ticket) {
      throw ApiError.notFound(`Ticket not found with ID: ${ticketId}`);
    }

    if (user.role === UserRole.EMPLOYEE && ticket.employeeId._id.toString() !== user.employeeId) {
      throw ApiError.forbidden('Access denied to other employee tickets');
    }

    return ticket;
  }

  async getMetrics() {
    return this.ticketRepo.getHelpdeskMetrics();
  }
}
