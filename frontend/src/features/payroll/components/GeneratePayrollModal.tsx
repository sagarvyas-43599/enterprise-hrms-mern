"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  User,
  Calculator,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  generatePayrollSchema,
  GeneratePayrollFormData,
} from "@/validations/payroll.schema";
import { useGeneratePayrollMutation, useAutoSyncPayrollMutation } from "@/redux/services/payrollApi";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";
import { useGetLeavesQuery } from "@/redux/services/leaveApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/uiSlice";

const MONTHS = [
  { value: 1, label: "January (01)" },
  { value: 2, label: "February (02)" },
  { value: 3, label: "March (03)" },
  { value: 4, label: "April (04)" },
  { value: 5, label: "May (05)" },
  { value: 6, label: "June (06)" },
  { value: 7, label: "July (07)" },
  { value: 8, label: "August (08)" },
  { value: 9, label: "September (09)" },
  { value: 10, label: "October (10)" },
  { value: 11, label: "November (11)" },
  { value: 12, label: "December (12)" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
];

export const GeneratePayrollModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const isOpen = activeModal === "GENERATE_PAYROLL";

  const [generatePayroll, { isLoading: isSubmitting }] =
    useGeneratePayrollMutation();
  const [autoSyncPayroll, { isLoading: isSyncing }] = useAutoSyncPayrollMutation();

  const { data: employeesData } = useGetEmployeesQuery(
    { limit: 100 },
    { skip: !isOpen }
  );
  const employees = employeesData?.data || [];

  const currentMonth = new Date().getMonth() + 1;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GeneratePayrollFormData>({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: {
      employeeId: "",
      month: currentMonth,
      year: CURRENT_YEAR,
      baseSalary: 0,
      allowances: [{ title: "House Rent Allowance (HRA)", amount: 0 }],
      deductions: [{ title: "Provident Fund (PF)", amount: 0 }],
    },
  });

  const {
    fields: allowanceFields,
    append: appendAllowance,
    remove: removeAllowance,
  } = useFieldArray({
    control,
    name: "allowances",
  });

  const {
    fields: deductionFields,
    append: appendDeduction,
    remove: removeDeduction,
  } = useFieldArray({
    control,
    name: "deductions",
  });

  const selectedEmployeeId = useWatch({ control, name: "employeeId" });
  const selectedMonth = useWatch({ control, name: "month" });
  const selectedYear = useWatch({ control, name: "year" });

  const { data: leavesData } = useGetLeavesQuery(
    {
      employeeId: selectedEmployeeId || undefined,
      limit: 100,
    },
    { skip: !selectedEmployeeId || !isOpen }
  );
  
  // Auto-fill base salary and calculate LOP when employee/month is selected
  useEffect(() => {
    if (selectedEmployeeId && employees.length > 0) {
      const emp = employees.find((e) => e._id === selectedEmployeeId);
      if (emp && typeof emp.baseSalary === "number") {
        setValue("baseSalary", emp.baseSalary, { shouldValidate: true });
        
        // Calculate LOP (Loss of Pay) for Unpaid Leaves in the selected month
        if (leavesData?.data) {
          const unpaidLeaves = leavesData.data.filter((leave) => 
            leave.leaveType === "UNPAID" && 
            leave.approvalStatus === "APPROVED" &&
            new Date(leave.startDate).getMonth() + 1 === Number(selectedMonth) &&
            new Date(leave.startDate).getFullYear() === Number(selectedYear)
          );
          
          let totalLopDays = 0;
          unpaidLeaves.forEach(l => totalLopDays += (l.daysCount || 0));
          
          if (totalLopDays > 0) {
            const perDaySalary = emp.baseSalary / 30;
            const lopDeduction = Math.round(totalLopDays * perDaySalary);
            
            // Set the deduction automatically
            const currentDeductions = control._formValues.deductions || [];
            // Remove old LOP if any
            const filtered = currentDeductions.filter((d: any) => !d.title.includes("Loss of Pay"));
            setValue("deductions", [
              ...filtered, 
              { title: `Loss of Pay (LOP) - ${totalLopDays} days`, amount: lopDeduction }
            ]);
          }
        }
      }
    }
  }, [selectedEmployeeId, selectedMonth, selectedYear, employees, leavesData, setValue, control]);

  // Watch values for real-time net salary calculator
  const watchedBase = useWatch({ control, name: "baseSalary" }) || 0;
  const watchedAllowances = useWatch({ control, name: "allowances" }) || [];
  const watchedDeductions = useWatch({ control, name: "deductions" }) || [];

  const totalAllowances = watchedAllowances.reduce(
    (sum, a) => sum + (Number(a?.amount) || 0),
    0
  );
  const totalDeductions = watchedDeductions.reduce(
    (sum, d) => sum + (Number(d?.amount) || 0),
    0
  );
  const netCalculatedSalary = Math.max(
    0,
    Number(watchedBase) + totalAllowances - totalDeductions
  );

  const handleClose = () => {
    reset({
      employeeId: "",
      month: currentMonth,
      year: CURRENT_YEAR,
      baseSalary: 0,
      allowances: [{ title: "House Rent Allowance (HRA)", amount: 0 }],
      deductions: [{ title: "Provident Fund (PF)", amount: 0 }],
    });
    dispatch(closeModal());
  };

  const onSubmit = async (data: GeneratePayrollFormData) => {
    try {
      const payload = {
        employeeId: data.employeeId,
        month: Number(data.month),
        year: Number(data.year),
        baseSalary: Number(data.baseSalary),
        allowances: data.allowances.map((a) => ({
          title: a.title,
          amount: Number(a.amount) || 0,
        })),
        deductions: data.deductions.map((d) => ({
          title: d.title,
          amount: Number(d.amount) || 0,
        })),
      };

      const res = await generatePayroll(payload).unwrap();
      toast.success(
        res.message || "Salary slip generated successfully in Draft status!"
      );
      handleClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        "Failed to generate payroll. Please verify details.";
      toast.error(msg);
    }
  };

  const handleAutoSync = async () => {
    const selectedEmployeeId = control._formValues.employeeId;
    const selectedMonth = control._formValues.month;
    const selectedYear = control._formValues.year;

    if (!selectedEmployeeId || !selectedMonth || !selectedYear) {
      toast.error("Please select an Employee, Month, and Year to auto-sync.");
      return;
    }

    try {
      const res = await autoSyncPayroll({
        employeeId: selectedEmployeeId,
        month: Number(selectedMonth),
        year: Number(selectedYear),
      }).unwrap();

      toast.success(res.message || "Payroll auto-synced with Attendance!");
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to auto-sync payroll.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Monthly Salary Slip"
      description="Calculate base earnings, add allowances and deductions to generate employee payroll slip"
      maxWidth="lg"
    >
      <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl mb-4 border border-blue-100 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300 flex-1 pr-4">
          <span className="font-semibold">Enterprise Tip:</span> You can instantly auto-calculate Overtime Pay and Shortfall deductions based on the employee's Attendance module records.
        </p>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAutoSync}
          isLoading={isSyncing}
          leftIcon={<Calculator className="w-4 h-4" />}
          className="shrink-0"
        >
          Auto-Sync from Attendance
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        {/* Employee Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Select Employee <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              {...register("employeeId")}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.empId}) — {emp.department || "No Dept"}
                </option>
              ))}
            </select>
          </div>
          {errors.employeeId?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.employeeId.message}
            </p>
          )}
        </div>

        {/* Month & Year & Base Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Month */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Payroll Month <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("month", { valueAsNumber: true })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {errors.month?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.month.message}
              </p>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Payroll Year <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("year", { valueAsNumber: true })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {errors.year?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.year.message}
              </p>
            )}
          </div>

          {/* Base Salary */}
          <div>
            <Input
              label="Base Salary ($)"
              type="number"
              min={0}
              step="any"
              placeholder="e.g. 5000"
              required
              {...register("baseSalary", { valueAsNumber: true })}
              error={errors.baseSalary?.message}
            />
          </div>
        </div>

        {/* Dynamic Allowances Section */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Earnings & Allowances (+)
            </span>
            <button
              type="button"
              onClick={() => appendAllowance({ title: "", amount: 0 })}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Allowance
            </button>
          </div>

          {allowanceFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Allowance title (e.g. HRA, Medical)"
                {...register(`allowances.${index}.title` as const)}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                min={0}
                placeholder="Amount ($)"
                {...register(`allowances.${index}.amount` as const, {
                  valueAsNumber: true,
                })}
                className="w-28 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {allowanceFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAllowance(index)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Remove allowance"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Deductions Section */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Statutory Deductions (-)
            </span>
            <button
              type="button"
              onClick={() => appendDeduction({ title: "", amount: 0 })}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Deduction
            </button>
          </div>

          {deductionFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Deduction title (e.g. PF, TDS Tax)"
                {...register(`deductions.${index}.title` as const)}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <input
                type="number"
                min={0}
                placeholder="Amount ($)"
                {...register(`deductions.${index}.amount` as const, {
                  valueAsNumber: true,
                })}
                className="w-28 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              {deductionFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDeduction(index)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Remove deduction"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Live Calculation Preview Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200/60 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-time Net Disbursal Estimate:</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              ${Number(watchedBase || 0).toLocaleString()} (Base) + $
              {totalAllowances.toLocaleString()} (Allowances) - $
              {totalDeductions.toLocaleString()} (Deductions)
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Net Payable:
            </span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${netCalculatedSalary.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons - Identical to AddEmployeeModal footer */}
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
            leftIcon={<CreditCard className="w-4 h-4" />}
          >
            Generate Salary Slip
          </Button>
        </div>
      </form>
    </Modal>
  );
};
