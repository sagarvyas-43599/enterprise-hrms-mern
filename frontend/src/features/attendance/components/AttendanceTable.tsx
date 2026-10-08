"use client";

import React from "react";
import { Clock, LogOut, MapPin, Calendar, UserCheck, Edit } from "lucide-react";
import { toast } from "sonner";
import { AttendanceRecord } from "../types/attendance.types";
import { getAttendanceStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatTime } from "@/lib/utils";
import { useClockOutMutation } from "@/redux/services/attendanceApi";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { Pagination } from "@/components/ui/Pagination";

interface AttendanceTableProps {
  records?: AttendanceRecord[];
  isLoading: boolean;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  canManage?: boolean;
  onRegularizeClick?: (record: AttendanceRecord) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records = [],
  isLoading,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
  canManage,
  onRegularizeClick,
}) => {
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();

  const handleClockOut = async (record: AttendanceRecord) => {
    try {
      const employeeId =
        typeof record.employeeId === "object"
          ? record.employeeId?._id
          : record.employeeId;

      await clockOut({
        employeeId: employeeId || undefined,
        remarks: "Shift completed via web dashboard",
      }).unwrap();

      toast.success("Clock-out recorded successfully! Shift concluded.");
    } catch {
      toast.error("Failed to record clock-out. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Attendance Logs Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No punch records recorded for this selected time window. Punch clock-in
          to begin your work shift.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
              <th className="py-3.5 px-4">Employee / Date</th>
              <th className="py-3.5 px-4">Clock In</th>
              <th className="py-3.5 px-4">Clock Out</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Location & Notes</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {records.map((record) => {
              const isClockedInOnly = record.clockIn && !record.clockOut;
              const hours = Math.floor(record.workDurationMinutes / 60);
              const minutes = record.workDurationMinutes % 60;
              const durationFormatted =
                record.workDurationMinutes > 0
                  ? `${hours}h ${minutes}m`
                  : isClockedInOnly
                  ? "In Progress..."
                  : "0m";

              const employeeDisplay =
                typeof record.employeeId === "object" && record.employeeId
                  ? `${record.employeeId.firstName || ""} ${
                      record.employeeId.lastName || ""
                    }`.trim() || record.employeeId.employeeId
                  : "Self";

              return (
                <tr
                  key={record._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Employee & Date */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>{employeeDisplay}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(record.date)}
                    </div>
                  </td>

                  {/* Clock In */}
                  <td className="py-3.5 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(record.clockIn)}</span>
                    </div>
                  </td>

                  {/* Clock Out */}
                  <td className="py-3.5 px-4 font-medium">
                    {record.clockOut ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        {formatTime(record.clockOut)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Shift
                      </span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {durationFormatted}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getAttendanceStatusBadge(record.status)}
                  </td>

                  {/* Location & Remarks */}
                  <td className="py-3.5 px-4 max-w-xs">
                    {record.location?.address && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {record.location.address}
                        </span>
                      </div>
                    )}
                    {record.remarks && (
                      <p className="text-[11px] text-slate-400 truncate italic mt-0.5">
                        &quot;{record.remarks}&quot;
                      </p>
                    )}
                    {!record.location?.address && !record.remarks && (
                      <span className="text-slate-400 text-[11px]">--</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isClockedInOnly ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleClockOut(record)}
                          isLoading={isClockingOut}
                          leftIcon={<LogOut className="w-3 h-3" />}
                        >
                          Punch Out
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Completed
                        </span>
                      )}
                      
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onRegularizeClick?.(record)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ml-1"
                          title="Regularize Attendance (Admin Edit)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalItems > 0 && onPageChange && onLimitChange && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};
