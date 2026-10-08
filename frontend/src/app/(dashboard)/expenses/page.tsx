"use client";

import React, { useState } from "react";
import { Receipt, Plus, RefreshCw, Filter, FileSpreadsheet, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetExpensesQuery } from "@/redux/services/expenseApi";
import { ExpenseTable } from "@/features/expenses/components/ExpenseTable";
import { AddExpenseModal } from "@/features/expenses/components/AddExpenseModal";
import { UpdateExpenseStatusModal } from "@/features/expenses/components/UpdateExpenseStatusModal";
import { ExpenseDetailModal } from "@/features/expenses/components/ExpenseDetailModal";
import { Expense } from "@/features/expenses/types/expense.types";
import { useAppSelector } from "@/redux/hooks";

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const { user } = useAppSelector((state) => state.auth);
  const isManagerOrAdmin = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"].includes(user?.role || "");

  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExpenseForUpdate, setSelectedExpenseForUpdate] = useState<Expense | null>(null);
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] = useState<Expense | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, refetch, isFetching } = useGetExpensesQuery({
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    search: debouncedSearch.trim() || undefined,
    isMyExpenses: !isManagerOrAdmin,
    page,
    limit,
  });

  const expenses = data?.data?.expenses || [];
  const meta = data?.data?.pagination || { total: 0 };

  const filteredExpenses = expenses;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Receipt className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Expenses & Claims
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage employee reimbursements and corporate expenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Claim
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING_MANAGER">PENDING MANAGER</option>
            <option value="PENDING_FINANCE">PENDING FINANCE</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PAID">PAID</option>
          </select>

          {(selectedStatus !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("ALL");
                setSearchQuery("");
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 font-semibold"
            >
              Reset
            </button>
          )}
          
          {isManagerOrAdmin && (
            <Button variant="outline" size="sm" className="ml-2" leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}>
              Export
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px]">
           <p className="text-slate-500 text-sm">Loading expenses...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No matching expenses</h3>
            <p className="text-xs text-slate-500 mb-4">Try adjusting your filters or search query.</p>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <ExpenseTable
            expenses={filteredExpenses}
            isLoading={isLoading}
            canManage={isManagerOrAdmin}
            onUpdateStatus={(expense) => setSelectedExpenseForUpdate(expense)}
            onViewDetails={(expense) => setSelectedExpenseForDetail(expense)}
            currentPage={page}
            totalItems={meta.total}
            itemsPerPage={limit}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </div>
      )}

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <UpdateExpenseStatusModal
        isOpen={!!selectedExpenseForUpdate}
        onClose={() => setSelectedExpenseForUpdate(null)}
        expense={selectedExpenseForUpdate}
      />

      <ExpenseDetailModal
        isOpen={!!selectedExpenseForDetail}
        onClose={() => setSelectedExpenseForDetail(null)}
        expense={selectedExpenseForDetail}
      />
    </div>
  );
}
