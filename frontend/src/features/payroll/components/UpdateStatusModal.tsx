"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Calendar, Hash } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  updatePayrollStatusSchema,
  UpdatePayrollStatusFormData,
} from "@/validations/payroll.schema";
import { useUpdatePayrollStatusMutation } from "@/redux/services/payrollApi";
import { PayrollSlip, PayrollStatus } from "../types/payroll.types";

interface UpdateStatusModalProps {
  payroll: PayrollSlip | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  payroll,
  isOpen,
  onClose,
}) => {
  const [updateStatus, { isLoading: isSubmitting }] =
    useUpdatePayrollStatusMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdatePayrollStatusFormData>({
    resolver: zodResolver(updatePayrollStatusSchema),
    defaultValues: {
      status: "PROCESSED",
      paymentDate: new Date().toISOString().split("T")[0],
      transactionRef: "",
    },
  });

  const selectedStatus = useWatch({ control, name: "status" });

  useEffect(() => {
    if (payroll) {
      reset({
        status: payroll.status === "DRAFT" ? "PROCESSED" : "PAID",
        paymentDate: payroll.paymentDate
          ? new Date(payroll.paymentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        transactionRef: payroll.transactionRef || "",
      });
    }
  }, [payroll, reset]);

  if (!payroll) return null;

  const emp =
    typeof payroll.employeeId === "object" && payroll.employeeId
      ? payroll.employeeId
      : null;
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : "Staff Member";

  const onSubmit = async (data: UpdatePayrollStatusFormData) => {
    try {
      const payload = {
        status: data.status,
        paymentDate:
          data.status === "PAID" && data.paymentDate
            ? new Date(data.paymentDate).toISOString()
            : undefined,
        transactionRef:
          data.status === "PAID" && data.transactionRef?.trim()
            ? data.transactionRef.trim()
            : undefined,
      };

      const res = await updateStatus({
        id: payroll._id,
        body: payload,
      }).unwrap();

      toast.success(
        res.message || `Payroll status updated to ${data.status} successfully!`
      );
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message || "Failed to update payroll status. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Payroll Lifecycle Status"
      description={`Transition status for ${empName} (${emp?.empId || "EMP"})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Selected Record Snapshot */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Employee:{" "}
              <strong className="text-slate-900 dark:text-white">
                {empName}
              </strong>
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Net: ${(payroll.netSalary || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Current Status:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {payroll.status}
            </span>{" "}
            • Period: Month {payroll.month}/{payroll.year}
          </p>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            New Lifecycle Status <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("status")}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
            disabled={payroll.status === "PAID"}
          >
            {payroll.status === "DRAFT" && (
              <option value="DRAFT">DRAFT (Initial calculation stage)</option>
            )}
            {payroll.status !== "PAID" && (
              <option value="PROCESSED">
                PROCESSED (Approved by HR/Finance, scheduled for payout)
              </option>
            )}
            <option value="PAID">
              PAID (Amount disbursed to employee account)
            </option>
          </select>
          {errors.status?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Fields when PAID is selected */}
        {selectedStatus === "PAID" && (
          <div className="space-y-3 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
              Disbursal Details
            </span>

            <Input
              label="Disbursal / Payment Date"
              type="date"
              {...register("paymentDate")}
              error={errors.paymentDate?.message}
            />

            <Input
              label="Bank Transaction / UTR Reference"
              placeholder="e.g. UTR-9821894291 or TXN-44281"
              {...register("transactionRef")}
              error={errors.transactionRef?.message}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={payroll.status === "PAID"}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Update Lifecycle Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};
