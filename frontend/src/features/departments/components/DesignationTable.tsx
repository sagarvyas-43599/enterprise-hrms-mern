"use client";

import React from "react";
import {
  Briefcase,
  Building,
  DollarSign,
  Pencil,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import { Designation } from "../types/department.types";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useAppSelector } from "@/redux/hooks";

interface DesignationTableProps {
  designations?: Designation[];
  isLoading: boolean;
  onEdit?: (designation: Designation) => void;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const DesignationTable: React.FC<DesignationTableProps> = ({
  designations = [],
  isLoading,
  onEdit,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const canManage =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  if (designations.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Designations Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No designation roles matching the criteria. Click Add Designation to
          define job titles and pay bands.
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
              <th className="py-3.5 px-4">Designation Role</th>
              <th className="py-3.5 px-4">Department Unit</th>
              <th className="py-3.5 px-4">Pay Grade</th>
              <th className="py-3.5 px-4">Salary Band</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {designations.map((desg) => {
              const deptName =
                typeof desg.departmentId === "object" && desg.departmentId
                  ? (desg.departmentId as any).name
                  : "Assigned Division";

              const hasSalaryBand =
                (desg.minSalary && desg.minSalary > 0) ||
                (desg.maxSalary && desg.maxSalary > 0);

              return (
                <tr
                  key={desg._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Title & Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {desg.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {desg.code}
                          </span>
                        </div>
                        {desg.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                            {desg.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                      <Building className="w-3.5 h-3.5 text-blue-500" />
                      <span>{deptName}</span>
                    </div>
                  </td>

                  {/* Pay Grade */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                      <Award className="w-3 h-3 text-indigo-500" />
                      <span>{desg.payGrade}</span>
                    </span>
                  </td>

                  {/* Salary Band */}
                  <td className="py-3.5 px-4">
                    {hasSalaryBand ? (
                      <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span>
                          {desg.minSalary ? `$${desg.minSalary.toLocaleString()}` : "$0"}{" "}
                          –{" "}
                          {desg.maxSalary ? `$${desg.maxSalary.toLocaleString()}` : "Open"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">
                        Market Standard
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {desg.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Inactive</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {canManage ? (
                      <div className="flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit?.(desg)}
                          title="Edit designation"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700">—</span>
                    )}
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
