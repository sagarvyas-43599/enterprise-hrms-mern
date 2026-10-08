import { Types, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { ITicket, TicketModel, ITicketMessage } from '../models/ticket.model';
import { TicketStatus, TicketPriority } from '../constants/enums';

export class TicketRepository extends BaseRepository<ITicket> {
  constructor() {
    super(TicketModel);
  }

  async generateNextTicketId(): Promise<string> {
    const latest = await this.model
      .findOne({}, { ticketId: 1 })
      .sort({ createdAt: -1 })
      .exec();

    let nextNum = 1001;
    if (latest && latest.ticketId) {
      const parts = latest.ticketId.split('-');
      const currentNum = parseInt(parts[1] || '1000', 10);
      if (!isNaN(currentNum)) {
        nextNum = currentNum + 1;
      }
    }

    let isUnique = false;
    let candidateId = `TKT-${nextNum}`;
    let maxTries = 50;
    
    while (!isUnique && maxTries > 0) {
      const exists = await this.model.exists({ ticketId: candidateId });
      if (exists) {
        nextNum++;
        candidateId = `TKT-${nextNum}`;
        maxTries--;
      } else {
        isUnique = true;
      }
    }
    
    return candidateId;
  }

  async findTicketsWithDetails(
    filter: FilterQuery<ITicket>,
    skip: number,
    limit: number
  ): Promise<{ tickets: ITicket[]; total: number }> {
    const finalFilter = { ...filter, isDeleted: false };

    const [tickets, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .populate({
          path: 'employeeId',
          select: 'empId firstName lastName department designation phone',
        })
        .populate({
          path: 'assignedTo',
          select: 'empId firstName lastName designation department',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);

    return { tickets, total };
  }

  async findByIdWithDetails(id: string | Types.ObjectId): Promise<ITicket | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .populate({
        path: 'employeeId',
        select: 'empId firstName lastName department designation phone',
      })
      .populate({
        path: 'assignedTo',
        select: 'empId firstName lastName designation department',
      })
      .exec();
  }

  async addMessage(
    ticketId: string | Types.ObjectId,
    messageObj: ITicketMessage
  ): Promise<ITicket | null> {
    return this.model
      .findOneAndUpdate(
        { _id: ticketId, isDeleted: false },
        { $push: { conversations: messageObj } },
        { new: true }
      )
      .exec();
  }

  async getHelpdeskMetrics() {
    const metrics = await this.model.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ['$status', TicketStatus.OPEN] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', TicketStatus.IN_PROGRESS] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', TicketStatus.RESOLVED] }, 1, 0] },
          },
          closed: {
            $sum: { $cond: [{ $eq: ['$status', TicketStatus.CLOSED] }, 1, 0] },
          },
          urgent: {
            $sum: { $cond: [{ $eq: ['$priority', TicketPriority.URGENT] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      metrics[0] || {
        totalTickets: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        urgent: 0,
      }
    );
  }
}
