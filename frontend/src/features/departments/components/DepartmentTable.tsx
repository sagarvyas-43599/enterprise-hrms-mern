"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  DollarSign,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Department } from "../types/department.types";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { Button } from "@/components/ui/Button";
import { useDeleteDepartmentMutation } from "@/redux/services/departmentApi";
import { useAppSelector } from "@/redux/hooks";
import { Pagination } from "@/components/ui/Pagination";

import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface DepartmentTableProps {
  departments?: Department[];
  isLoading: boolean;
  onEdit?: (department: Department) => void;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments = [],
  isLoading,
  onEdit,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);

  const canManage =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartment(departmentToDelete._id).unwrap();
      toast.success(
        `Department '${departmentToDelete.name}' deleted successfully.`
      );
      setDepartmentToDelete(null);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        "Failed to delete department. Ensure no employees are assigned to it.";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
          <Building2 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Departments Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No corporate departments matched your search filter. Click Add Department
          to establish a new organizational unit.
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
              <th className="py-3.5 px-4">Department Unit</th>
              <th className="py-3.5 px-4">Head of Department (HOD)</th>
              <th className="py-3.5 px-4">Annual Budget</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {departments.map((dept) => {
              const hod =
                typeof dept.headOfDepartmentId === "object" &&
                dept.headOfDepartmentId
                  ? dept.headOfDepartmentId
                  : null;

              return (
                <tr
                  key={dept._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Department Unit & Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {dept.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {dept.code}
                          </span>
                        </div>
                        {dept.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                            {dept.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Head of Department */}
                  <td className="py-3.5 px-4">
                    {hod ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                          {hod.firstName?.charAt(0) || "H"}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {hod.firstName} {hod.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {hod.empId} {hod.designation ? `• ${hod.designation}` : ""}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Unassigned HOD
                      </span>
                    )}
                  </td>

                  {/* Annual Budget */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      <span>
                        {dept.annualBudget && dept.annualBudget > 0
                          ? `$${dept.annualBudget.toLocaleString()}`
                          : "Undisclosed"}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {dept.isActive !== false ? (
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit?.(dept)}
                          title="Edit department"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDepartmentToDelete(dept)}
                          title="Delete department"
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Popup Modal - Same styling as Create Employee Modal */}
      <ConfirmModal
        isOpen={!!departmentToDelete}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        description="Are you sure you want to remove this department from active organization structure?"
        itemName={departmentToDelete?.name}
        itemSubtext={departmentToDelete?.code}
        confirmText="Delete Department"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
