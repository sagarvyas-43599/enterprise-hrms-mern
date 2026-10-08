"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  Building,
  Calendar,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Users,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Employee } from "../types/employee.types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { useDeleteEmployeeMutation } from "@/redux/services/employeeApi";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";

import { useAppSelector } from "@/redux/hooks";
import { Pagination } from "@/components/ui/Pagination";

import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface EmployeeTableProps {
  employees?: Employee[];
  isLoading: boolean;
  onEdit?: (employee: Employee) => void;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees = [],
  isLoading,
  onEdit,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );

  const canManage =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee(employeeToDelete._id).unwrap();
      toast.success(
        `Employee profile ${employeeToDelete.empId} (${employeeToDelete.firstName} ${employeeToDelete.lastName}) deleted successfully.`
      );
      setEmployeeToDelete(null);
    } catch {
      toast.error("Failed to delete employee profile. Please try again.");
    }
  };

  const getRoleBadge = (role?: string) => {
    const formatted = role ? role.replace(/_/g, " ") : "EMPLOYEE";
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge variant="danger">{formatted}</Badge>;
      case "HR_ADMIN":
        return <Badge variant="purple">{formatted}</Badge>;
      case "MANAGER":
        return <Badge variant="info">{formatted}</Badge>;
      case "EMPLOYEE":
      default:
        return <Badge variant="neutral">{formatted}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Employee Records Matched
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No employees found matching the active search query or filter
          criteria. Click Onboard New Employee to register staff.
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
              <th className="py-3.5 px-4">Employee Profile</th>
              <th className="py-3.5 px-4">Department & Title</th>
              <th className="py-3.5 px-4">System Role</th>
              <th className="py-3.5 px-4">Reporting Manager</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Contact & Joining</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {employees.map((emp) => {
              const initials = `${emp.firstName?.charAt(0) || ""}${
                emp.lastName?.charAt(0) || ""
              }`.toUpperCase();

              const isActive = emp.userId?.isActive !== false;

              return (
                <tr
                  key={emp._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Profile & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                      {emp.profileImage ? (
                        <img
                          src={emp.profileImage}
                          alt={`${emp.firstName} ${emp.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials || "EM"
                      )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {emp.empId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{emp.userId?.email || "No email"}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Designation */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-500" />
                      <span>{emp.department}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {emp.designation}
                    </div>
                    {typeof emp.reportingManagerId === "object" &&
                      emp.reportingManagerId && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Mgr: {emp.reportingManagerId.firstName}{" "}
                          {emp.reportingManagerId.lastName}
                        </div>
                      )}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    {getRoleBadge(emp.userId?.role)}
                  </td>

                  {/* Reporting Manager */}
                  <td className="py-3.5 px-4">
                    {typeof emp.reportingManagerId === "object" && emp.reportingManagerId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {`${emp.reportingManagerId.firstName?.charAt(0) || ""}${emp.reportingManagerId.lastName?.charAt(0) || ""}`.toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {emp.reportingManagerId.firstName} {emp.reportingManagerId.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No Manager</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {isActive ? (
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

                  {/* Contact & Date */}
                  <td className="py-3.5 px-4">
                    {emp.phone && (
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Joined {formatDate(emp.joinedAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {canManage ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit?.(emp)}
                          title="Edit employee"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEmployeeToDelete(emp)}
                          title="Delete employee"
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
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee Profile"
        description="Are you sure you want to remove this employee record from the active corporate directory?"
        itemName={
          employeeToDelete
            ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}`
            : ""
        }
        itemSubtext={employeeToDelete?.empId}
        confirmText="Delete Employee"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
