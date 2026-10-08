"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Laptop, Pencil, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  updateAssetSchema,
  UpdateAssetFormData,
} from "@/validations/asset.schema";
import { useUpdateAssetMutation } from "@/redux/services/assetApi";
import { Asset, AssetCondition, AssetStatus } from "../types/asset.types";

interface EditAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

const CONDITIONS: { value: AssetCondition; label: string }[] = [
  { value: "NEW", label: "Brand New" },
  { value: "EXCELLENT", label: "Excellent Condition" },
  { value: "GOOD", label: "Good Working Condition" },
  { value: "FAIR", label: "Fair / Operational" },
  { value: "DAMAGED", label: "Damaged / Defective" },
];

const STATUSES: { value: AssetStatus; label: string }[] = [
  { value: "AVAILABLE", label: "IN STOCK (AVAILABLE)" },
  { value: "ALLOCATED", label: "ALLOCATED" },
  { value: "UNDER_REPAIR", label: "UNDER REPAIR" },
  { value: "RETIRED", label: "RETIRED" },
  { value: "LOST", label: "LOST" },
];

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
}) => {
  const [updateAsset, { isLoading: isSubmitting }] = useUpdateAssetMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UpdateAssetFormData>({
    resolver: zodResolver(updateAssetSchema),
    defaultValues: {
      name: "",
      brand: "",
      modelNumber: "",
      condition: "GOOD",
      status: "AVAILABLE",
      purchaseCost: 0,
      purchaseDate: "",
      warrantyExpiry: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (asset && isOpen) {
      reset({
        name: asset.name || "",
        brand: asset.brand || "",
        modelNumber: asset.modelNumber || "",
        condition: asset.condition || "GOOD",
        status: asset.status || "AVAILABLE",
        purchaseCost: asset.purchaseCost || 0,
        purchaseDate: asset.purchaseDate
          ? new Date(asset.purchaseDate).toISOString().split("T")[0]
          : "",
        warrantyExpiry: asset.warrantyExpiry
          ? new Date(asset.warrantyExpiry).toISOString().split("T")[0]
          : "",
        notes: asset.notes || "",
      });
    }
  }, [asset, isOpen, reset]);

  if (!asset) return null;

  const onSubmit = async (data: UpdateAssetFormData) => {
    try {
      const payload = {
        name: data.name.trim(),
        brand: data.brand.trim(),
        modelNumber: data.modelNumber?.trim() || undefined,
        condition: data.condition,
        status: data.status,
        purchaseCost:
          data.purchaseCost !== undefined ? Number(data.purchaseCost) : undefined,
        purchaseDate: data.purchaseDate ? data.purchaseDate : undefined,
        warrantyExpiry: data.warrantyExpiry ? data.warrantyExpiry : null,
        notes: data.notes?.trim() || undefined,
      };

      const res = await updateAsset({
        id: asset._id,
        body: payload,
      }).unwrap();

      toast.success(res.message || "Asset details updated successfully!");
      onClose();
    } catch (err: any) {
      const apiErrors = err?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        apiErrors.forEach((issue: any) => {
          if (issue.field) {
            setError(issue.field as any, {
              type: "server",
              message: issue.message,
            });
          }
        });
      } else {
        const msg = err?.data?.message || "Failed to update asset details.";
        toast.error(msg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Hardware Asset Details"
      description={`Update specifications and inventory status for ${asset.assetTag}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Name & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Hardware Model Name"
            placeholder="e.g. MacBook Pro M3 Max 16-inch"
            required
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Brand / Manufacturer"
            placeholder="e.g. Apple, Dell, Lenovo"
            required
            {...register("brand")}
            error={errors.brand?.message}
          />
        </div>

        {/* Model Number & Condition & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Model Number"
            placeholder="e.g. A2992, XPS-9530"
            {...register("modelNumber")}
            error={errors.modelNumber?.message}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Physical Condition <span className="text-rose-500">*</span>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Inventory Status <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("status")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            {errors.status?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Purchase Valuation & Warranty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Purchase Cost ($)"
            type="number"
            min={0}
            step="any"
            placeholder="e.g. 2499"
            {...register("purchaseCost", { valueAsNumber: true })}
            error={errors.purchaseCost?.message}
          />

          <Input
            label="Procurement Date"
            type="date"
            {...register("purchaseDate")}
            error={errors.purchaseDate?.message}
          />

          <Input
            label="Warranty Expiry Date"
            type="date"
            {...register("warrantyExpiry")}
            error={errors.warrantyExpiry?.message}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Internal Hardware Notes / Specifications
          </label>
          <textarea
            rows={2}
            placeholder="RAM, SSD size, accessory bundle (charger, dongles), vendor warranty details..."
            {...register("notes")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          {errors.notes?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.notes.message}
            </p>
          )}
        </div>

        {/* Footer Actions */}
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
            leftIcon={<Pencil className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
