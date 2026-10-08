"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Receipt, AlertCircle, UploadCloud } from "lucide-react";
import { useCreateExpenseMutation } from "@/redux/services/expenseApi";

const EXPENSE_CATEGORIES = [
  { value: "TRAVEL", label: "Travel & Transport" },
  { value: "MEALS", label: "Meals & Entertainment" },
  { value: "ACCOMMODATION", label: "Accommodation" },
  { value: "OFFICE_SUPPLIES", label: "Office Supplies" },
  { value: "SOFTWARE", label: "Software & Subscriptions" },
  { value: "TRAINING", label: "Training & Development" },
  { value: "OTHER", label: "Other Expenses" },
];

const expenseSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100),
  description: z.string()
    .min(1, "Description is required")
    .min(5, "Please provide a detailed description"),
  category: z.enum([
    "TRAVEL",
    "MEALS",
    "ACCOMMODATION",
    "OFFICE_SUPPLIES",
    "SOFTWARE",
    "TRAINING",
    "OTHER",
  ], {
    errorMap: () => ({ message: "Category is required" }),
  }),
  amount: z.number().min(1, "Amount must be greater than 0"),
  currency: z.string().min(3).max(3).default("USD"),
  dateIncurred: z.string().refine((date) => new Date(date) <= new Date(), {
    message: "Date cannot be in the future",
  }),
  receiptUrl: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: "USD",
      receiptUrl: "",
    },
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await createExpense(data).unwrap();
      onClose();
    } catch (error: any) {
      console.error("Failed to submit expense:", error);
      const msg = error?.data?.message || error?.message || "Failed to submit expense";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Expense Claim"
      description="File a new corporate expense for reimbursement. Attach valid receipts for faster processing."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Expense Title"
          placeholder="e.g. Client Dinner at San Francisco"
          required
          {...register("title")}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("category")}
              className={`w-full h-10 px-3 rounded-xl border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                errors.category?.message
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            >
              <option value="">Select category...</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.category.message as string}
              </p>
            )}
          </div>

          <Input
            label="Date Incurred"
            type="date"
            required
            max={new Date().toISOString().split("T")[0]}
            {...register("dateIncurred")}
            error={errors.dateIncurred?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            required
            {...register("amount", { valueAsNumber: true })}
            error={errors.amount?.message}
          />
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Currency
            </label>
            <select
              {...register("currency")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Business Purpose & Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Provide context on why this expense was incurred..."
            {...register("description")}
            className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 resize-none ${
              errors.description?.message
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
            }`}
          />
          {errors.description?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Receipt / Invoice <span className="text-rose-500">* (For claims &gt; $50)</span>
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative">
            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-2">
              <label className="font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer">
                Click to upload
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setValue("receiptUrl", url, { shouldValidate: true });
                      toast.success(`Mock uploaded: ${file.name}`);
                    }
                  }}
                />
              </label> or drag and drop<br />
              <span className="text-[10px]">SVG, PNG, JPG or PDF (max. 5MB)</span>
            </p>
            <div className="w-full relative mt-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Receipt className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="url"
                placeholder="Or paste receipt URL here..."
                {...register("receiptUrl")}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          {errors.receiptUrl?.message && (
            <p className="text-[11px] text-rose-500">{errors.receiptUrl.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} leftIcon={<UploadCloud className="w-4 h-4" />}>
            Submit Claim
          </Button>
        </div>
      </form>
    </Modal>
  );
};
