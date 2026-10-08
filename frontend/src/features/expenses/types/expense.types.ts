export type ExpenseStatus = "PENDING_MANAGER" | "PENDING_FINANCE" | "APPROVED" | "REJECTED" | "PAID";
export type ExpenseCategory = "TRAVEL" | "MEALS" | "ACCOMMODATION" | "OFFICE_SUPPLIES" | "SOFTWARE" | "TRAINING" | "OTHER";

export interface Expense {
  _id: string;
  employee: {
    _id: string;
    empId: string;
    firstName: string;
    lastName: string;
    department: string;
  } | string;
  title: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  receiptUrl?: string;
  dateIncurred: string;
  status: ExpenseStatus;
  managerApprovedBy?: { _id: string; firstName: string; lastName: string; } | string;
  financeApprovedBy?: { _id: string; firstName: string; lastName: string; } | string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
