"use client";

import React, { useState } from "react";
import { 
  Receipt, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Eye, 
  Trash2,
  MoreHorizontal 
} from "lucide-react";
import { useDeleteExpenseMutation } from "@/redux/services/expenseApi";
import { toast } from "sonner";
import { Expense, ExpenseStatus } from "../types/expense.types";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ExpenseTableProps {
  expenses?: Expense[];
  isLoading: boolean;
  onViewDetails?: (expense: Expense) => void;
  onUpdateStatus?: (expense: Expense) => void;
  canManage?: boolean;
  // Pagination
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses = [],
  isLoading,
  onViewDetails,
  onUpdateStatus,
  canManage = false,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();
  const [expenseToWithdraw, setExpenseToWithdraw] = useState<Expense | null>(null);

  const handleConfirmWithdraw = async () => {
    if (!expenseToWithdraw) return;
    try {
      await deleteExpense(expenseToWithdraw._id).unwrap();
      toast.success("Expense claim withdrawn successfully");
      setExpenseToWithdraw(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to withdraw claim");
    }
  };
  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">APPROVED</Badge>;
      case "PAID":
        return <Badge variant="info">PAID</Badge>;
      case "REJECTED":
        return <Badge variant="danger">REJECTED</Badge>;
      case "PENDING_FINANCE":
        return <Badge variant="warning">PENDING FINANCE</Badge>;
      case "PENDING_MANAGER":
      default:
        return <Badge variant="warning">PENDING MGR</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
          <Receipt className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Expenses Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No expense claims match the current filters.
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
              <th className="py-3.5 px-4">Claim Details</th>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Date Incurred</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {expenses.map((expense) => {
              const emp =
                typeof expense.employee === "object" && expense.employee
                  ? expense.employee
                  : null;
              const empName = emp
                ? `${emp.firstName} ${emp.lastName}`
                : "Unknown Staff";
              const empId = emp?.empId || "EMP";

              return (
                <tr
                  key={expense._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Title & Category */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {expense.title}
                        </p>
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 mt-0.5 block">
                          {expense.category.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Employee */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                        {emp?.firstName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white leading-tight">
                          {empName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {empId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                      <span>{expense.currency === "INR" ? "₹" : "$"}</span>
                      {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>

                  {/* Date Incurred */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(expense.dateIncurred)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(expense.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails?.(expense)}
                        className="h-7 px-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {canManage && (expense.status === "PENDING_MANAGER" || expense.status === "PENDING_FINANCE") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus?.(expense);
                          }}
                          className="h-7 px-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Review & Update Status"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )}

                      {!canManage && expense.status === "PENDING_MANAGER" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpenseToWithdraw(expense);
                          }}
                          disabled={isDeleting}
                          className="h-7 px-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                          title="Withdraw Claim"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

      {/* Confirm Withdraw Modal */}
      <ConfirmModal
        isOpen={!!expenseToWithdraw}
        onClose={() => setExpenseToWithdraw(null)}
        onConfirm={handleConfirmWithdraw}
        title="Withdraw Expense Claim"
        description="Are you sure you want to withdraw this claim? This action cannot be undone."
        itemName={expenseToWithdraw ? expenseToWithdraw.title : ""}
        itemSubtext={
          expenseToWithdraw
            ? `${expenseToWithdraw.currency === "INR" ? "₹" : "$"}${expenseToWithdraw.amount}`
            : ""
        }
        confirmText="Withdraw Claim"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />
    </div>
  );
};
