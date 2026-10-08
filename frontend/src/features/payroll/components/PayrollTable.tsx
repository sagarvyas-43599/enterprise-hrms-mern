"use client";

import React from "react";
import {
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRightCircle,
  Building,
  DollarSign,
  Calendar,
} from "lucide-react";
import { PayrollSlip, PayrollStatus } from "../types/payroll.types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { Pagination } from "@/components/ui/Pagination";
import { useAppSelector } from "@/redux/hooks";

interface PayrollTableProps {
  payrolls?: PayrollSlip[];
  isLoading: boolean;
  onViewSlip?: (payroll: PayrollSlip) => void;
  onUpdateStatus?: (payroll: PayrollSlip) => void;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const PayrollTable: React.FC<PayrollTableProps> = ({
  payrolls = [],
  isLoading,
  onViewSlip,
  onUpdateStatus,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const canManage =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  const getStatusBadge = (status: PayrollStatus) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">PAID</Badge>;
      case "PROCESSED":
        return <Badge variant="info">PROCESSED</Badge>;
      case "DRAFT":
      default:
        return <Badge variant="warning">DRAFT</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (payrolls.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
          <CreditCard className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Payroll Records Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No monthly salary slips matching the current filter. Click Generate
          Payroll to initiate salary slips for this period.
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
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Pay Period</th>
              <th className="py-3.5 px-4">Base Salary</th>
              <th className="py-3.5 px-4">Allowances (+)</th>
              <th className="py-3.5 px-4">Deductions (-)</th>
              <th className="py-3.5 px-4">Net Salary</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {payrolls.map((payroll) => {
              const emp =
                typeof payroll.employeeId === "object" && payroll.employeeId
                  ? payroll.employeeId
                  : null;

              const empName = emp
                ? `${emp.firstName} ${emp.lastName}`
                : "Staff Member";
              const empCode = emp?.empId || "EMP";
              const initials = emp
                ? `${emp.firstName?.charAt(0) || ""}${
                    emp.lastName?.charAt(0) || ""
                  }`
                : "EM";

              const monthName =
                payroll.month >= 1 && payroll.month <= 12
                  ? MONTH_NAMES[payroll.month - 1]
                  : `Month ${payroll.month}`;

              return (
                <tr
                  key={payroll._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Employee Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {empName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {empCode}
                          </span>
                        </div>
                        {emp?.department && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>
                              {emp.department}{" "}
                              {emp.designation ? `• ${emp.designation}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Pay Period */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        {monthName} {payroll.year}
                      </span>
                    </div>
                  </td>

                  {/* Base Salary */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                    ${(payroll.baseSalary || 0).toLocaleString()}
                  </td>

                  {/* Allowances */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                      +${(payroll.totalAllowances || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Deductions */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                      -${(payroll.totalDeductions || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Net Salary */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      ${(payroll.netSalary || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {getStatusBadge(payroll.status)}
                      {payroll.paymentDate && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(payroll.paymentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Payslip Button */}
                      <button
                        type="button"
                        onClick={() => onViewSlip?.(payroll)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="View itemized payslip"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Manage Status Button (Admin/HR only) */}
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus?.(payroll)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Update status (Mark as Processed / Paid)"
                        >
                          <ArrowRightCircle className="w-4 h-4" />
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
