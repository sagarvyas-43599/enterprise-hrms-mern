export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE"
  | "ON_LEAVE"
  | "HOLIDAY";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface AttendanceRecord {
  _id: string;
  employeeId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        empId: string;
        email: string;
        designation?: { title: string };
        department?: { name: string };
      };
  date: string;
  clockIn: string;
  clockOut?: string | null;
  status: AttendanceStatus;
  workDurationMinutes: number;
  overtimeMinutes: number;
  shortfallMinutes: number;
  location?: GeoLocation;
  ipAddress?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceResponse {
  success: boolean;
  message?: string;
  data: AttendanceRecord;
}

export interface AttendanceListResponse {
  success: boolean;
  message?: string;
  data: {
    records: AttendanceRecord[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      stats?: {
        presentDays: number;
        lateDays: number;
        halfDays: number;
        totalMinutes: number;
        totalOvertime: number;
        totalShortfall: number;
      };
    };
  };
}

export interface AttendanceQueryParams {
  search?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface ClockInPayload {
  employeeId?: string;
  location?: GeoLocation;
  remarks?: string;
}

export interface ClockOutPayload {
  employeeId?: string;
  remarks?: string;
}
