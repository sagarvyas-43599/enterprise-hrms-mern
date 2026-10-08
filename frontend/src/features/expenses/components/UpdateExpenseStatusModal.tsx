"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Expense, ExpenseStatus } from "../types/expense.types";
import { useUpdateExpenseStatusMutation } from "@/redux/services/expenseApi";

const updateStatusSchema = z.object({
  status: z.enum(["PENDING_FINANCE", "APPROVED", "REJECTED", "PAID"]),
  rejectionReason: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.status === "REJECTED" && (!data.rejectionReason || data.rejectionReason.length < 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide a valid reason for rejection (min 5 chars)",
      path: ["rejectionReason"],
    });
  }
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

interface UpdateExpenseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export const UpdateExpenseStatusModal: React.FC<UpdateExpenseStatusModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  const [updateStatus, { isLoading }] = useUpdateExpenseStatusMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: expense?.status === "PENDING_MANAGER" ? "PENDING_FINANCE" : "APPROVED",
      rejectionReason: "",
    },
  });

  const selectedStatus = watch("status");

  useEffect(() => {
    if (isOpen && expense) {
      reset({
        status: expense.status === "PENDING_MANAGER" ? "PENDING_FINANCE" : "APPROVED",
        rejectionReason: "",
      });
    } else if (!isOpen) {
      reset();
    }
  }, [isOpen, expense, reset]);

  if (!expense) return null;

  const onSubmit = async (data: UpdateStatusFormData) => {
    try {
      await updateStatus({
        id: expense._id,
        status: data.status,
        rejectionReason: data.status === "REJECTED" ? data.rejectionReason : undefined,
      }).unwrap();
      toast.success("Expense status updated successfully");
      onClose();
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(error?.data?.message || "Failed to update expense status");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Expense Claim"
      description={`Review and update the status of ${expense.title}.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Expense Summary */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-900 dark:text-white">Amount Requested:</span>
            <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
              {expense.currency === "INR" ? "₹" : "$"}{expense.amount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Category:</span>
            <span>{expense.category}</span>
          </div>
          <p className="mt-2 text-slate-500 line-clamp-2">"{expense.description}"</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Action / Status Update <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("status")}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {expense.status === "PENDING_MANAGER" && (
              <option value="PENDING_FINANCE">Approve (Send to Finance)</option>
            )}
            {expense.status === "PENDING_FINANCE" && (
              <option value="APPROVED">Approve (Final)</option>
            )}
            {expense.status !== "PENDING_MANAGER" && expense.status !== "PENDING_FINANCE" && (
              <option value="APPROVED">APPROVED</option>
            )}
            <option value="REJECTED">Reject Claim</option>
            <option value="PAID">Mark as Paid</option>
          </select>
        </div>

        {selectedStatus === "REJECTED" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explain why this claim is rejected..."
              {...register("rejectionReason")}
              className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 resize-none ${
                errors.rejectionReason?.message
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />
            {errors.rejectionReason?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.rejectionReason.message}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} variant={selectedStatus === "REJECTED" ? "danger" : "primary"}>
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};
