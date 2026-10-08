"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  Plus,
  RefreshCw,
  Filter,
  AlertCircle,
  FileSpreadsheet,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LeaveBalanceCards } from "@/features/leaves/components/LeaveBalanceCards";
import { LeaveTable } from "@/features/leaves/components/LeaveTable";
import { ApplyLeaveModal } from "@/features/leaves/components/ApplyLeaveModal";
import {
  useGetLeavesQuery,
  useGetLeaveBalancesQuery,
} from "@/redux/services/leaveApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/uiSlice";
import {
  LeaveStatus,
  LeaveType,
} from "@/features/leaves/types/leave.types";

export default function LeavesPage() {
  const dispatch = useAppDispatch();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedStatus, selectedType, limit]);

  const { user } = useAppSelector((state) => state.auth);

  // Fetch leaves query
  const {
    data: leavesData,
    isLoading: isLoadingLeaves,
    isError: isLeavesError,
    refetch: refetchLeaves,
    isFetching: isFetchingLeaves,
  } = useGetLeavesQuery({
    search: debouncedSearch || undefined,
    status:
      selectedStatus !== "ALL"
        ? (selectedStatus as LeaveStatus)
        : undefined,
    leaveType:
      selectedType !== "ALL" ? (selectedType as LeaveType) : undefined,
    page,
    limit,
  });

  // Fetch leave balances
  const { data: balanceData } = useGetLeaveBalancesQuery();

  const leaves = leavesData?.data || [];
  const meta = leavesData?.meta || { total: 0 };
  const balances = balanceData?.data?.balances || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <CalendarCheck className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Leave & Time-Off Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit absence applications, track remaining annual quotas, and
              process manager reviews.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchLeaves()}
            isLoading={isFetchingLeaves}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => dispatch(openModal({ modalType: "APPLY_LEAVE" }))}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Leave Quota Balance Overview */}
      <LeaveBalanceCards balances={balances} />

      {/* Error Alert */}
      {isLeavesError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold">
                Unable to load leave applications
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Please verify MongoDB Atlas connectivity or retry your session.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-rose-300 text-rose-700 hover:bg-rose-100"
            onClick={() => refetchLeaves()}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Filter and Control Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Bar for HRs/Admins */}
          {user?.role !== "EMPLOYEE" ? (
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leaves by Employee Name..."
                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          ) : (
            <div></div> /* Empty div to push filters to the right */
          )}

          <div className="flex flex-wrap items-center gap-3">
          {/* Status filter dropdown */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none h-10 pl-3 pr-8 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
              >
                <option value="ALL">All Requests</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category filter dropdown & export */}
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Categories</option>
              <option value="CASUAL">Casual</option>
              <option value="SICK">Sick</option>
              <option value="MATERNITY">Maternity</option>
              <option value="PATERNITY">Paternity</option>
              <option value="UNPAID">Unpaid</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Export Logs
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Leave Records Table */}
      <LeaveTable 
        leaves={leaves} 
        isLoading={isLoadingLeaves || isFetchingLeaves}
        currentPage={page}
        totalItems={meta.total}
        itemsPerPage={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal />
    </div>
  );
}
