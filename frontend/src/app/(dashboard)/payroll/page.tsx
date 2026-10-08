"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PayrollStatsCards } from "@/features/payroll/components/PayrollStatsCards";
import { PayrollTable } from "@/features/payroll/components/PayrollTable";
import { GeneratePayrollModal } from "@/features/payroll/components/GeneratePayrollModal";
import { PayslipModal } from "@/features/payroll/components/PayslipModal";
import { UpdateStatusModal } from "@/features/payroll/components/UpdateStatusModal";
import {
  useGetPayrollListQuery,
  useGetPayrollAnalyticsQuery,
} from "@/redux/services/payrollApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/uiSlice";
import { PayrollSlip, PayrollStatus } from "@/features/payroll/types/payroll.types";

const MONTHS = [
  { value: "ALL", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [
  { value: "ALL", label: "All Years" },
  { value: String(CURRENT_YEAR), label: String(CURRENT_YEAR) },
  { value: String(CURRENT_YEAR - 1), label: String(CURRENT_YEAR - 1) },
  { value: String(CURRENT_YEAR + 1), label: String(CURRENT_YEAR + 1) },
];

export default function PayrollPage() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedMonth, selectedYear, selectedStatus, limit]);

  // Modals state
  const [selectedPayrollForSlip, setSelectedPayrollForSlip] =
    useState<PayrollSlip | null>(null);
  const [selectedPayrollForStatus, setSelectedPayrollForStatus] =
    useState<PayrollSlip | null>(null);

  const canManage =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  // Fetch Payroll Slips List
  const {
    data: payrollData,
    isLoading,
    isFetching,
    refetch,
  } = useGetPayrollListQuery({
    month: selectedMonth !== "ALL" ? Number(selectedMonth) : undefined,
    year: selectedYear !== "ALL" ? Number(selectedYear) : undefined,
    status:
      selectedStatus !== "ALL" ? (selectedStatus as PayrollStatus) : undefined,
    search: debouncedSearch.trim() || undefined,
    page,
    limit,
  });

  // Fetch Corporate Analytics
  const { data: analyticsData } = useGetPayrollAnalyticsQuery(
    selectedMonth !== "ALL" || selectedYear !== "ALL"
      ? {
          month: selectedMonth !== "ALL" ? Number(selectedMonth) : undefined,
          year: selectedYear !== "ALL" ? Number(selectedYear) : undefined,
        }
      : undefined
  );

  const payrolls: PayrollSlip[] = payrollData?.data || [];
  const meta = payrollData?.meta || { total: 0 };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            <CreditCard className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Payroll & Compensation Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monthly salary slip generation, statutory tax withholdings, CTC
              breakdown, and disbursals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh
          </Button>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                dispatch(openModal({ modalType: "GENERATE_PAYROLL" }))
              }
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Generate Payroll
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Overview */}
      <PayrollStatsCards
        payrolls={payrolls}
        analytics={analyticsData?.data}
        isLoading={isLoading}
      />

      {/* Enterprise Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee name, ID or UTR txn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {YEARS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PROCESSED">PROCESSED</option>
            <option value="PAID">PAID</option>
          </select>

          {(selectedMonth !== "ALL" ||
            selectedYear !== "ALL" ||
            selectedStatus !== "ALL" ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedMonth("ALL");
                setSelectedYear("ALL");
                setSelectedStatus("ALL");
                setSearchQuery("");
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <PayrollTable
        payrolls={payrolls}
        isLoading={isLoading || isFetching}
        onViewSlip={(payroll) => setSelectedPayrollForSlip(payroll)}
        onUpdateStatus={(payroll) => setSelectedPayrollForStatus(payroll)}
        currentPage={page}
        totalItems={meta.total}
        itemsPerPage={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {/* Modal 1: Generate Monthly Salary Slip */}
      <GeneratePayrollModal />

      {/* Modal 2: View Itemized Corporate Payslip */}
      <PayslipModal
        payroll={selectedPayrollForSlip}
        isOpen={!!selectedPayrollForSlip}
        onClose={() => setSelectedPayrollForSlip(null)}
      />

      {/* Modal 3: Update Lifecycle Status */}
      <UpdateStatusModal
        payroll={selectedPayrollForStatus}
        isOpen={!!selectedPayrollForStatus}
        onClose={() => setSelectedPayrollForStatus(null)}
      />
    </div>
  );
}
