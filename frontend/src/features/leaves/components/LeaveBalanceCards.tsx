import React from "react";
import {
  CalendarCheck,
  HeartPulse,
  Baby,
  Smile,
  ClockAlert,
} from "lucide-react";
import { LeaveBalanceItem } from "../types/leave.types";

interface LeaveBalanceCardsProps {
  balances?: LeaveBalanceItem[];
}

export const LeaveBalanceCards: React.FC<LeaveBalanceCardsProps> = ({
  balances = [],
}) => {
  const getLeaveIcon = (type: string) => {
    switch (type) {
      case "CASUAL":
        return <Smile className="w-5 h-5 text-blue-600" />;
      case "SICK":
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case "MATERNITY":
      case "PATERNITY":
        return <Baby className="w-5 h-5 text-purple-600" />;
      case "UNPAID":
      default:
        return <ClockAlert className="w-5 h-5 text-amber-600" />;
    }
  };

  const getLeaveTheme = (type: string) => {
    switch (type) {
      case "CASUAL":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40",
          bar: "bg-blue-600",
        };
      case "SICK":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          bar: "bg-rose-600",
        };
      case "MATERNITY":
      case "PATERNITY":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/40",
          bar: "bg-purple-600",
        };
      case "UNPAID":
      default:
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          bar: "bg-amber-600",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {balances.map((item) => {
        const theme = getLeaveTheme(item.leaveType);
        const usedPercent =
          item.annualQuota > 0
            ? Math.round((item.usedDays / item.annualQuota) * 100)
            : 0;

        return (
          <div
            key={item.leaveType}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.leaveType} LEAVE
              </span>
              <div className={`p-2 rounded-xl ${theme.bg}`}>
                {getLeaveIcon(item.leaveType)}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {item.remainingDays}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {item.annualQuota} days left
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {item.usedDays} days utilized this year
              </p>
            </div>

            {/* Quota Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${theme.bar} transition-all duration-500`}
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
