"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Undo2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  returnAssetSchema,
  ReturnAssetFormData,
} from "@/validations/asset.schema";
import { useReturnAssetMutation } from "@/redux/services/assetApi";
import { Asset, AssetCondition } from "../types/asset.types";

interface ReturnAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

const CONDITIONS: { value: AssetCondition; label: string }[] = [
  { value: "EXCELLENT", label: "Excellent Condition (No scratches)" },
  { value: "GOOD", label: "Good (Normal operational wear)" },
  { value: "FAIR", label: "Fair (Visible cosmetic blemishes)" },
  { value: "DAMAGED", label: "Damaged (Needs repair / diagnostic)" },
];

export const ReturnAssetModal: React.FC<ReturnAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
}) => {
  const [returnAsset, { isLoading: isSubmitting }] = useReturnAssetMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReturnAssetFormData>({
    resolver: zodResolver(returnAssetSchema),
    defaultValues: {
      condition: "GOOD",
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!asset) return null;

  const emp =
    typeof asset.allocatedTo === "object" && asset.allocatedTo
      ? asset.allocatedTo
      : null;

  const onSubmit = async (data: ReturnAssetFormData) => {
    try {
      const res = await returnAsset({
        id: asset._id,
        body: {
          condition: data.condition,
          notes: data.notes?.trim(),
        },
      }).unwrap();

      toast.success(
        res.message || `Asset '${asset.name}' checked back into inventory successfully!`
      );
      handleClose();
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to check in asset. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Check-in / Return Hardware"
      description={`De-allocate and return equipment back to inventory storage`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Current Custody Info Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              {asset.name}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {asset.assetTag}
            </span>
          </div>
          {emp && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Returning Staff:{" "}
              <strong className="text-slate-900 dark:text-white">
                {emp.firstName} {emp.lastName} ({emp.empId})
              </strong>
            </p>
          )}
        </div>

        {/* Returned Physical Condition */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Returned Physical Condition <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("condition")}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {CONDITIONS.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
          {errors.condition?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.condition.message}
            </p>
          )}
        </div>

        {/* Inspection Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Inspection & Check-in Remarks
          </label>
          <textarea
            rows={3}
            placeholder="Document any physical scratches, battery health, missing accessories, or required diagnostic repairs..."
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
            leftIcon={<Undo2 className="w-4 h-4" />}
          >
            Confirm Return
          </Button>
        </div>
      </form>
    </Modal>
  );
};
