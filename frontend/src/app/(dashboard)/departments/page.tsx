"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Briefcase,
  Plus,
  RefreshCw,
  Search,
  DollarSign,
  Layers,
  Award,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DepartmentTable } from "@/features/departments/components/DepartmentTable";
import { DesignationTable } from "@/features/departments/components/DesignationTable";
import { AddDepartmentModal } from "@/features/departments/components/AddDepartmentModal";
import { EditDepartmentModal } from "@/features/departments/components/EditDepartmentModal";
import { AddDesignationModal } from "@/features/departments/components/AddDesignationModal";
import { EditDesignationModal } from "@/features/departments/components/EditDesignationModal";
import { Department, Designation } from "@/features/departments/types/department.types";
import {
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
} from "@/redux/services/departmentApi";
import { useAppSelector } from "@/redux/hooks";

export default function DepartmentsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<"DEPARTMENTS" | "DESIGNATIONS">(
    "DEPARTMENTS"
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modals state
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [isAddDesgOpen, setIsAddDesgOpen] = useState(false);
  const [editingDesg, setEditingDesg] = useState<Designation | null>(null);

  const isEmployeeRole = user?.role === "EMPLOYEE";
  const canManage =
    user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN";

  // 1. Fetch departments
  const {
    data: deptsData,
    isLoading: isLoadingDepts,
    isFetching: isFetchingDepts,
    refetch: refetchDepts,
  } = useGetDepartmentsQuery(
    {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch.trim() || undefined,
      isActive: selectedStatus !== "ALL" ? (selectedStatus === "ACTIVE" ? "true" : "false") : undefined,
    },
    { skip: isEmployeeRole }
  );

  // 2. Fetch designations
  const {
    data: desgData,
    isLoading: isLoadingDesg,
    isFetching: isFetchingDesg,
    refetch: refetchDesg,
  } = useGetDesignationsQuery(
    {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch.trim() || undefined,
      isActive: selectedStatus !== "ALL" ? (selectedStatus === "ACTIVE" ? "true" : "false") : undefined,
    },
    { skip: isEmployeeRole }
  );

  const departments = deptsData?.data?.departments || [];
  const departmentsMeta = deptsData?.data?.pagination || { total: 0 };
  
  const designations = desgData?.data?.designations || [];
  const designationsMeta = desgData?.data?.pagination || { total: 0 };

  // Reset page when search or status changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStatus, activeTab, itemsPerPage]);

  const handleRefresh = () => {
    if (activeTab === "DEPARTMENTS") {
      refetchDepts();
    } else {
      refetchDesg();
    }
  };

  if (isEmployeeRole) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Department Master Administration Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Organizational structure management, HOD appointments, and designation
          pay bands are restricted to HR Administrators and Leadership staff.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/profile">
            <Button variant="primary" size="sm" leftIcon={<User className="w-4 h-4" />}>
              View My Profile
            </Button>
          </Link>
          <Link href="/employees">
            <Button variant="outline" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              Workforce Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Org Structure & Department Master
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enterprise organizational divisions, department leadership,
              budget allocation, and career pay bands.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isFetchingDepts || isFetchingDesg}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          {canManage && (
            <>
              {activeTab === "DEPARTMENTS" ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddDeptOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Department
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddDesgOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Designation
                </Button>
              )}
            </>
          )}
        </div>
      </div>


      {/* Tabs and Search Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab("DEPARTMENTS")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === "DEPARTMENTS"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Departments ({departmentsMeta.total})</span>
          </button>

          <button
            onClick={() => setActiveTab("DESIGNATIONS")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === "DESIGNATIONS"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Designations ({designationsMeta.total})</span>
          </button>
        </div>

        {/* Search input & Status filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "DEPARTMENTS"
                  ? "Search departments..."
                  : "Search designations..."
              }
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
            }
            className="py-1.5 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Content Table */}
      {activeTab === "DEPARTMENTS" ? (
        <DepartmentTable
          departments={departments}
          isLoading={isLoadingDepts || isFetchingDepts}
          onEdit={(dept) => setEditingDept(dept)}
          currentPage={currentPage}
          totalItems={departmentsMeta.total}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onLimitChange={setItemsPerPage}
        />
      ) : (
        <DesignationTable
          designations={designations}
          isLoading={isLoadingDesg || isFetchingDesg}
          onEdit={(desg) => setEditingDesg(desg)}
          currentPage={currentPage}
          totalItems={designationsMeta.total}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onLimitChange={setItemsPerPage}
        />
      )}

      {/* Department Modals */}
      <AddDepartmentModal
        isOpen={isAddDeptOpen}
        onClose={() => setIsAddDeptOpen(false)}
      />

      <EditDepartmentModal
        isOpen={!!editingDept}
        onClose={() => setEditingDept(null)}
        department={editingDept}
      />

      {/* Designation Modals */}
      <AddDesignationModal
        isOpen={isAddDesgOpen}
        onClose={() => setIsAddDesgOpen(false)}
      />

      <EditDesignationModal
        isOpen={!!editingDesg}
        onClose={() => setEditingDesg(null)}
        designation={editingDesg}
      />
    </div>
  );
}
