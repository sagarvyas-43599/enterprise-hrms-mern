export type TicketCategory =
  | "IT_SUPPORT"
  | "PAYROLL_QUERY"
  | "HR_POLICY"
  | "FACILITIES_ADMIN"
  | "GENERAL";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface EmployeeRef {
  _id: string;
  empId: string;
  firstName: string;
  lastName: string;
  department?: string;
  designation?: string;
  email?: string;
}

export interface TicketMessage {
  _id?: string;
  senderId:
    | {
        _id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        role?: string;
      }
    | string;
  senderModel?: string;
  senderName?: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  employeeId?: EmployeeRef | string;
  raisedBy?: EmployeeRef | string;
  assignedTo?: EmployeeRef | string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  conversations?: TicketMessage[];
  messages?: TicketMessage[];
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketMetrics {
  totalTickets?: number;
  total?: number;
  open?: number;
  inProgress?: number;
  resolved?: number;
  closed?: number;
  urgent?: number;
  criticalPending?: number;
}
