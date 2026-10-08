"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Expense } from "../types/expense.types";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Receipt, Calendar, User, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  if (!expense) return null;

  const emp = typeof expense.employee === "object" ? expense.employee : null;
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Staff";
  const empId = emp?.empId || "EMP";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Expense Claim Details"
      description={`View full details of claim ${expense.title}`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {expense.currency === "INR" ? "₹" : "$"}
              {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{expense.category.replace("_", " ")}</p>
          </div>
          <div>
            {expense.status === "APPROVED" && <Badge variant="success">APPROVED</Badge>}
            {expense.status === "PENDING_MANAGER" && <Badge variant="warning">PENDING MGR</Badge>}
            {expense.status === "PENDING_FINANCE" && <Badge variant="warning">PENDING FINANCE</Badge>}
            {expense.status === "REJECTED" && <Badge variant="danger">REJECTED</Badge>}
            {expense.status === "PAID" && <Badge variant="info">PAID</Badge>}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <User className="w-4 h-4" />
              <span className="text-xs font-semibold">Employee</span>
            </div>
            <p className="font-medium text-slate-900 dark:text-white">{empName}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{empId}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold">Date Incurred</span>
            </div>
            <p className="font-medium text-slate-900 dark:text-white">{formatDate(expense.dateIncurred)}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold">Business Purpose</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {expense.description}
          </div>
        </div>

        {/* Rejection Reason if any */}
        {expense.status === "REJECTED" && expense.rejectionReason && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">Rejection Reason</p>
            <p className="text-sm text-rose-600 dark:text-rose-300">{expense.rejectionReason}</p>
          </div>
        )}

        {/* Receipt URL */}
        {expense.receiptUrl && (
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 mb-2">
              <Receipt className="w-4 h-4" />
              <span className="text-xs font-semibold">Attached Receipt</span>
            </div>
            <a
              href={expense.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 transition-colors group"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">View Original Receipt</span>
            </a>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
