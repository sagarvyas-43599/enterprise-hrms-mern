"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus, Laptop, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  allocateAssetSchema,
  AllocateAssetFormData,
} from "@/validations/asset.schema";
import { useAllocateAssetMutation } from "@/redux/services/assetApi";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";
import { Asset } from "../types/asset.types";

interface AllocateAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AllocateAssetModal: React.FC<AllocateAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
}) => {
  const [allocateAsset, { isLoading: isSubmitting }] =
    useAllocateAssetMutation();

  const { data: employeesData } = useGetEmployeesQuery(
    { limit: 100 },
    { skip: !isOpen }
  );
  const employees = employeesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AllocateAssetFormData>({
    resolver: zodResolver(allocateAssetSchema),
    defaultValues: {
      employeeId: "",
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!asset) return null;

  const onSubmit = async (data: AllocateAssetFormData) => {
    try {
      const res = await allocateAsset({
        id: asset._id,
        body: {
          employeeId: data.employeeId,
          notes: data.notes?.trim(),
        },
      }).unwrap();

      toast.success(
        res.message || `Asset '${asset.name}' successfully allocated to employee!`
      );
      handleClose();
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to allocate asset. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Allocate Hardware to Staff"
      description={`Assign equipment custody for ${asset.name} (${asset.assetTag})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Selected Asset Details */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              {asset.name}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {asset.assetTag}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            S/N: {asset.serialNumber} • Brand: {asset.brand}
          </p>
        </div>

        {/* Employee Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Assign To Employee <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("employeeId")}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Select Employee...</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} ({emp.empId}) — {emp.department || "No Dept"}
              </option>
            ))}
          </select>
          {errors.employeeId?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.employeeId.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Handover Remarks / Accessories Included
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Handed over with 140W USB-C power adapter and carry bag..."
            {...register("notes")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Confirm Allocation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
