"use client";

import React from "react";
import {
  Target,
  Calendar,
  User,
  Building,
  CheckCircle2,
  Clock,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { Goal, GoalStatus } from "../types/performance.types";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

interface GoalTableProps {
  goals?: Goal[];
  isLoading: boolean;
  onUpdateProgress?: (goal: Goal) => void;
  // Pagination
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const GoalTable: React.FC<GoalTableProps> = ({
  goals = [],
  isLoading,
  onUpdateProgress,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const getStatusBadge = (status: GoalStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">COMPLETED</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">IN PROGRESS</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">CANCELLED</Badge>;
      case "NOT_STARTED":
      default:
        return <Badge variant="neutral">NOT STARTED</Badge>;
    }
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 40) return "bg-blue-500";
    return "bg-amber-500";
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
          <Target className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Performance Goals / OKRs Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No key objectives matching the filter criteria. Click Create Goal /
          OKR to define milestones and key performance indicators.
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
              <th className="py-3.5 px-4">Goal / Key Result</th>
              <th className="py-3.5 px-4">Assigned Staff</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Progress & Weightage</th>
              <th className="py-3.5 px-4">Target Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {goals.map((goal) => {
              const emp =
                typeof goal.employeeId === "object" && goal.employeeId
                  ? goal.employeeId
                  : null;
              const empName = emp
                ? `${emp.firstName} ${emp.lastName}`
                : "Assigned Staff";
              const empId = emp?.empId || "EMP";

              return (
                <tr
                  key={goal._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Goal Title & Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {goal.title}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {goal.description}
                      </p>
                    </div>
                  </td>

                  {/* Employee Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px] uppercase">
                        {empName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white block">
                          {empName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {empId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {goal.category || "General OKR"}
                    </span>
                  </td>

                  {/* Progress & Weightage */}
                  <td className="py-3.5 px-4 w-44">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold font-mono text-slate-900 dark:text-white">
                          {goal.progress || 0}%
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          Wt: {goal.weightage || 20}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(
                            goal.progress || 0
                          )}`}
                          style={{ width: `${Math.min(100, goal.progress || 0)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Target Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(goal.targetDate)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(goal.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onUpdateProgress?.(goal)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      title="Update goal progress percentage"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Update</span>
                    </button>
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
