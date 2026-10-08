export type UserRole =
  | "SUPER_ADMIN"
  | "HR_ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export interface EmployeeUser {
  _id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface Employee {
  _id: string;
  empId: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  profileImage?: string;
  phone?: string;
  baseSalary?: number;
  joinedAt: string;
  userId?: EmployeeUser;
  reportingManagerId?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        empId: string;
      }
    | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentStat {
  _id: string; // Department name
  count: number;
}

export interface EmployeeListResponse {
  success: boolean;
  message?: string;
  data: Employee[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface EmployeeDetailResponse {
  success: boolean;
  message?: string;
  data: Employee;
}

export interface DepartmentStatsResponse {
  success: boolean;
  message?: string;
  data: DepartmentStat[];
}

export interface EmployeeQueryParams {
  search?: string;
  department?: string;
  designation?: string;
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface CreateEmployeePayload {
  email: string;
  password: string;
  role?: UserRole;
  empId: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  profileImage?: string;
  reportingManagerId?: string | null;
  phone?: string;
  joinedAt?: string;
}

export interface UpdateEmployeePayload {
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;
  profileImage?: string;
  reportingManagerId?: string | null;
  phone?: string;
  isActive?: boolean;
}
