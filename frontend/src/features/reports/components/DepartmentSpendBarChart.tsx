"use client";

import React from "react";
import { Building2, TrendingUp, DollarSign } from "lucide-react";
import { DepartmentSummary } from "../types/report.types";

interface DepartmentSpendBarChartProps {
  departments: DepartmentSummary[];
  isLoading?: boolean;
}

export const DepartmentSpendBarChart: React.FC<DepartmentSpendBarChartProps> = ({
  departments = [],
  isLoading = false,
}) => {
  const maxBudget = Math.max(...departments.map((d) => d.annualBudget || 0), 1);
  const totalBudget = departments.reduce((acc, d) => acc + (d.annualBudget || 0), 0);

  const colors = [
    "from-indigo-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Department Budget Allocation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Corporate Allocated: ₹{totalBudget.toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {departments.length} Units
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500">
          No departments configured.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {departments.map((dept, idx) => {
            const percent = Math.min(100, Math.round((dept.annualBudget / maxBudget) * 100));
            const share = totalBudget > 0 ? Math.round((dept.annualBudget / totalBudget) * 100) : 0;
            const gradient = colors[idx % colors.length];

            return (
              <div key={dept.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {dept.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{dept.annualBudget.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({share}%)
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
