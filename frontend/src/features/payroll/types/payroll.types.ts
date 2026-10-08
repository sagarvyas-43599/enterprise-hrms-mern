export type PayrollStatus = "DRAFT" | "PROCESSED" | "PAID";

export interface AllowanceItem {
  title: string;
  amount: number;
}

export interface DeductionItem {
  title: string;
  amount: number;
}

export interface EmployeeRef {
  _id: string;
  empId: string;
  firstName: string;
  lastName: string;
  department?: string;
  designation?: string;
  email?: string;
}

export interface PayrollSlip {
  _id: string;
  employeeId: EmployeeRef | string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: AllowanceItem[];
  totalAllowances: number;
  deductions: DeductionItem[];
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string | null;
  transactionRef?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollAnalyticsAggItem {
  _id: {
    month: number;
    year: number;
  };
  totalGrossCost: number;
  totalNetPayout: number;
  totalDeductions: number;
  slipsGenerated: number;
}
