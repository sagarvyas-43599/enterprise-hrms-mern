"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Laptop,
  Tag,
  Hash,
  DollarSign,
  Calendar,
  Shield,
  FileText,
  Package,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createAssetSchema,
  CreateAssetFormData,
} from "@/validations/asset.schema";
import { useCreateAssetMutation } from "@/redux/services/assetApi";
import { AssetCategory, AssetCondition } from "../types/asset.types";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: "LAPTOP", label: "Laptop / Workstation" },
  { value: "DESKTOP", label: "Desktop PC / Tower" },
  { value: "MONITOR", label: "Monitor / Display" },
  { value: "MOBILE_PHONE", label: "Mobile Phone / Tablet" },
  { value: "ACCESSORY", label: "Accessory / Peripherals" },
  { value: "OFFICE_EQUIPMENT", label: "Office Equipment" },
  { value: "OTHER", label: "Other Hardware" },
];

const CONDITIONS: { value: AssetCondition; label: string }[] = [
  { value: "NEW", label: "Brand New" },
  { value: "EXCELLENT", label: "Excellent Condition" },
  { value: "GOOD", label: "Good Working Condition" },
  { value: "FAIR", label: "Fair / Operational" },
  { value: "DAMAGED", label: "Damaged / Defective" },
];

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createAsset, { isLoading: isSubmitting }] = useCreateAssetMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateAssetFormData>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      assetTag: "",
      name: "",
      category: "" as any,
      brand: "",
      modelNumber: "",
      serialNumber: "",
      condition: "" as any,
      purchaseCost: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      warrantyExpiry: "",
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateAssetFormData) => {
    try {
      const payload = {
        ...data,
        assetTag: data.assetTag.toUpperCase().trim(),
        purchaseCost: data.purchaseCost ? Number(data.purchaseCost) : undefined,
        warrantyExpiry: data.warrantyExpiry ? data.warrantyExpiry : null,
      };

      const res = await createAsset(payload).unwrap();
      toast.success(res.message || "Hardware asset added to inventory successfully!");
      handleClose();
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
        const msg =
          err?.data?.message || "Failed to register asset. Please verify input fields.";
        toast.error(msg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Inventory Asset"
      description="Register company hardware, laptops, peripherals, and procurement details into central tracking"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Asset Tag & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Asset Tag / Inventory Code"
            placeholder="e.g. AST-LPT-001"
            required
            {...register("assetTag")}
            error={errors.assetTag?.message}
          />

          <Input
            label="Hardware Model Name"
            placeholder="e.g. MacBook Pro M3 Max 16-inch"
            required
            {...register("name")}
            error={errors.name?.message}
          />
        </div>

        {/* Category & Brand & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Hardware Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <Input
            label="Brand / Manufacturer"
            placeholder="e.g. Apple, Dell, Lenovo"
            required
            {...register("brand")}
            error={errors.brand?.message}
          />

          <Input
            label="Model Number"
            placeholder="e.g. A2992, XPS-9530"
            {...register("modelNumber")}
            error={errors.modelNumber?.message}
          />
        </div>

        {/* Serial Number & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Hardware Serial Number (S/N)"
            placeholder="e.g. C02G8792MD6T"
            required
            {...register("serialNumber")}
            error={errors.serialNumber?.message}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Physical Condition <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("condition")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="" disabled>Select physical condition</option>
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
            leftIcon={<Laptop className="w-4 h-4" />}
          >
            Register Hardware Asset
          </Button>
        </div>
      </form>
    </Modal>
  );
};
