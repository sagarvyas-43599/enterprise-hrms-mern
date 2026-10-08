"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Building,
  AlertCircle,
  FileSpreadsheet,
  ShieldAlert,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";
import {
  useGetEmployeesQuery,
  useGetDepartmentStatsQuery,
} from "@/redux/services/employeeApi";
import { useAppSelector } from "@/redux/hooks";

export default function EmployeesPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when search, department, role, status, or limit changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedDept, selectedStatus, selectedRole, itemsPerPage]);

  const isEmployeeRole = user?.role === "EMPLOYEE";
  const canOnboard =
    user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN";

  // Fetch employees list with query params (skip if unauthorized role)
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    isError: isEmployeesError,
    refetch: refetchEmployees,
    isFetching: isFetchingEmployees,
  } = useGetEmployeesQuery(
    {
      search: debouncedSearch || undefined,
      department: selectedDept !== "ALL" ? selectedDept : undefined,
      status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      role: selectedRole !== "ALL" ? selectedRole : undefined,
      page: currentPage,
      limit: itemsPerPage,
    },
    { skip: isEmployeeRole }
  );

  // Fetch department stats overview
  const { data: statsData } = useGetDepartmentStatsQuery(undefined, {
    skip: isEmployeeRole,
  });

  if (isEmployeeRole) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Workforce Directory Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Access to enterprise workforce directory and personnel administration is restricted to HR Administrators and Managers under enterprise RBAC policy.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/profile">
            <Button variant="primary" size="sm" leftIcon={<User className="w-4 h-4" />}>
              View My Profile
            </Button>
          </Link>
          <Link href="/attendance">
            <Button variant="outline" size="sm" leftIcon={<Clock className="w-4 h-4" />}>
              My Attendance
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const employees = employeesData?.data || [];
  const paginationMeta = employeesData?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Workforce & Employee Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive personnel directory, role provisions, department
              assignments, and lifecycle tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchEmployees()}
            isLoading={isFetchingEmployees}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          {canOnboard && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/employees/create")}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Employee
            </Button>
          )}
        </div>
      </div>



      {/* Error Alert */}
      {isEmployeesError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold">
                Unable to load employee directory
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
            onClick={() => refetchEmployees()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-stretch gap-4">
        {/* Top row: Search and primary filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, employee code (EMP-...), or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            >
              <option value="ALL">All Roles</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR_ADMIN">HR Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            >
              <option value="ALL">All Divisions</option>
              <option value="Engineering & Technology">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Accounts">Finance</option>
              <option value="Operations & Facilities">Operations</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Data Table */}
      <EmployeeTable
        employees={employees}
        isLoading={isLoadingEmployees}
        onEdit={(emp) => router.push(`/employees/${emp._id}/edit`)}
        currentPage={currentPage}
        totalItems={paginationMeta.total || 0}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={setItemsPerPage}
      />
    </div>
  );
}
