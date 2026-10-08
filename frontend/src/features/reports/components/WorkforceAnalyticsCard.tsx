"use client";

import React from "react";
import { Users, Clock, CalendarCheck, ShieldCheck } from "lucide-react";

interface WorkforceAnalyticsCardProps {
  attendanceBreakdown?: { _id: string; count: number }[];
  leavesByStatus?: { _id: string; count: number }[];
  leavesByType?: { _id: string; count: number }[];
  isLoading?: boolean;
}

export const WorkforceAnalyticsCard: React.FC<WorkforceAnalyticsCardProps> = ({
  attendanceBreakdown = [],
  leavesByStatus = [],
  leavesByType = [],
  isLoading = false,
}) => {
  const totalAttendance = attendanceBreakdown.reduce((sum, a) => sum + a.count, 0) || 1;
  const totalLeaves = leavesByStatus.reduce((sum, l) => sum + l.count, 0) || 1;

  const attendanceColors: Record<string, string> = {
    PRESENT: "bg-emerald-500",
    WORK_FROM_HOME: "bg-blue-500",
    HALF_DAY: "bg-amber-500",
    ABSENT: "bg-rose-500",
    ON_LEAVE: "bg-purple-500",
  };

  const leaveColors: Record<string, string> = {
    APPROVED: "bg-emerald-500",
    PENDING: "bg-amber-500",
    REJECTED: "bg-rose-500",
    CANCELLED: "bg-slate-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Attendance Distribution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Attendance & Shift Stream
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Staff distribution logged today
              </p>
            </div>
          </div>
        </div>

        {attendanceBreakdown.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            No employee attendance punch records logged for today yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {attendanceBreakdown.map((item) => {
              const percent = Math.round((item.count / totalAttendance) * 100);
              const color = attendanceColors[item._id] || "bg-indigo-500";
              return (
                <div key={item._id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item._id.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.count} staff ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Requests Lifecycle */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Leave & Time-Off Lifecycle
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Absence applications status breakdown
            </p>
          </div>
        </div>

        {leavesByStatus.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            No corporate leave applications recorded.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {leavesByStatus.map((item) => {
              const color = leaveColors[item._id] || "bg-indigo-500";
              return (
                <div
                  key={item._id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {item._id}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {item.count}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
