import React from "react";
import { Building2, Users } from "lucide-react";
import { DepartmentStat } from "../types/employee.types";

interface DepartmentStatsCardProps {
  stats: DepartmentStat[];
  totalEmployees: number;
}

export const DepartmentStatsCard: React.FC<DepartmentStatsCardProps> = ({
  stats,
  totalEmployees,
}) => {
  const departmentColors: Record<string, string> = {
    Engineering: "from-blue-500 to-indigo-600",
    "Human Resources": "from-emerald-500 to-teal-600",
    Finance: "from-amber-500 to-orange-600",
    Marketing: "from-purple-500 to-pink-600",
    Operations: "from-sky-500 to-cyan-600",
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Department Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Workforce distribution across business divisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>{totalEmployees} Total Staff</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {stats.map((dept) => {
          const percentage =
            totalEmployees > 0
              ? Math.round((dept.count / totalEmployees) * 100)
              : 0;

          const gradient =
            departmentColors[dept._id] || "from-slate-600 to-slate-800";

          return (
            <div
              key={dept._id}
              className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[110px]">
                  {dept._id}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {percentage}%
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {dept.count}
                </span>
                <span className="text-[11px] text-slate-400">members</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                  style={{ width: `${Math.max(percentage, 8)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
