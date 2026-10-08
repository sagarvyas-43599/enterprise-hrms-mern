export type UserRole =
  | "SUPER_ADMIN"
  | "HR_ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  empId?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;
  profileImage?: string;
  phone?: string;
  joinedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role?: UserRole;
  empId: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  reportingManagerId?: string | null;
  phone?: string;
  joinedAt?: string;
}

export interface AuthBackendData {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  employee?: {
    id: string;
    empId: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
    profileImage?: string;
    phone?: string;
    joinedAt?: string;
  } | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: AuthBackendData;
}
