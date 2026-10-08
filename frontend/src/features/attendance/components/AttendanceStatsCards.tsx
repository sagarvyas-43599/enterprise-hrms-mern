import React from "react";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { AttendanceRecord } from "../types/attendance.types";

interface AttendanceStatsCardsProps {
  stats?: {
    presentDays: number;
    lateDays: number;
    halfDays: number;
    totalMinutes: number;
    totalOvertime: number;
    totalShortfall: number;
  };
  totalRecords?: number;
}

export const AttendanceStatsCards: React.FC<AttendanceStatsCardsProps> = ({
  stats,
  totalRecords = 0,
}) => {
  const presentDays = stats?.presentDays || 0;
  const lateDays = stats?.lateDays || 0;
  const halfDays = stats?.halfDays || 0;
  
  const totalMinutes = stats?.totalMinutes || 0;
  const totalHours = (totalMinutes / 60).toFixed(1);
  
  const totalOvertime = stats?.totalOvertime || 0;
  const overtimeHours = (totalOvertime / 60).toFixed(1);
  
  const totalShortfall = stats?.totalShortfall || 0;
  const shortfallHours = (totalShortfall / 60).toFixed(1);

  const onTimePercentage =
    totalRecords > 0
      ? Math.round(((totalRecords - lateDays) / totalRecords) * 100)
      : 100;

  const statCards = [
    {
      label: "Present Shifts",
      value: presentDays.toString(),
      subtext: `${onTimePercentage}% Arrival Compliance`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600",
    },
    {
      label: "Total Work Hours",
      value: `${totalHours} hrs`,
      subtext: "Cumulative tracked duration",
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600",
    },
    {
      label: "Overtime Logged",
      value: `${overtimeHours} hrs`,
      subtext: "Hours worked beyond shift",
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600",
    },
    {
      label: "Shortfall / Deviations",
      value: `${shortfallHours} hrs`,
      subtext: `${lateDays} Late • ${halfDays} Half Day`,
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((item, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {item.value}
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {item.subtext}
            </p>
          </div>
          <div className={`p-3 rounded-2xl ${item.bg}`}>{item.icon}</div>
        </div>
      ))}
    </div>
  );
};
