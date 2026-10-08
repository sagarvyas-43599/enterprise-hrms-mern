export type LeaveType =
  | "CASUAL"
  | "SICK"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveBalanceItem {
  leaveType: LeaveType;
  annualQuota: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveBalanceResponse {
  success: boolean;
  message?: string;
  data: {
    year: number;
    balances: LeaveBalanceItem[];
  };
}

export interface LeaveRecord {
  _id: string;
  employeeId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        empId: string;
        department?: string;
      };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  approvalStatus: LeaveStatus;
  approverId?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
      }
    | null;
  approvalRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveListResponse {
  success: boolean;
  message?: string;
  data: LeaveRecord[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApplyLeavePayload {
  employeeId?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ReviewLeavePayload {
  status: "APPROVED" | "REJECTED";
  remarks?: string;
}

export interface LeaveQueryParams {
  search?: string;
  employeeId?: string;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
