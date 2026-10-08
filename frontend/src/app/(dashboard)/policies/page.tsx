"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PolicyStatsCards } from "@/features/policies/components/PolicyStatsCards";
import { PolicyTable } from "@/features/policies/components/PolicyTable";
import { CreatePolicyModal } from "@/features/policies/components/CreatePolicyModal";
import { EditPolicyModal } from "@/features/policies/components/EditPolicyModal";
import { PolicyDetailModal } from "@/features/policies/components/PolicyDetailModal";
import { ComplianceReportModal } from "@/features/policies/components/ComplianceReportModal";
import {
  useGetPoliciesQuery,
  useGetMyPolicyAcknowledgmentsQuery,
} from "@/redux/services/policyApi";
import { useAppSelector } from "@/redux/hooks";
import {
  Policy,
  PolicyCategory,
  PolicyStatus,
} from "@/features/policies/types/policy.types";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "ALL", label: "All Categories" },
  { value: "HR_POLICY", label: "HR & People Operations" },
  { value: "IT_SECURITY", label: "IT & Cybersecurity" },
  { value: "COMPLIANCE_LEGAL", label: "Compliance & Regulatory Legal" },
  { value: "HEALTH_SAFETY", label: "Workplace Health & Safety" },
  { value: "CODE_OF_CONDUCT", label: "Corporate Code of Conduct" },
  { value: "GENERAL", label: "General Guidelines & Handbook" },
];

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Standards" },
  { value: "PUBLISHED", label: "Published & In Force" },
  { value: "DRAFT", label: "Drafts (Internal)" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function PoliciesPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<Policy | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<Policy | null>(null);
  const [selectedForCompliance, setSelectedForCompliance] = useState<Policy | null>(null);

  const isHrOrAdmin =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  // RTK Query: fetch policies with dynamic query filters
  const {
    data: policiesData,
    isLoading,
    refetch,
    isFetching,
  } = useGetPoliciesQuery({
    search: debouncedSearch.trim() || undefined,
    category:
      selectedCategory !== "ALL"
        ? (selectedCategory as PolicyCategory)
        : undefined,
    status:
      selectedStatus !== "ALL"
        ? (selectedStatus as PolicyStatus)
        : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // RTK Query: fetch user's personal policy acknowledgments
  const { data: myAcksData } = useGetMyPolicyAcknowledgmentsQuery();

  const policies = policiesData?.data || [];
  const myAcknowledgments = myAcksData?.data || [];

  const signedPolicyIds = new Set<string>(
    myAcknowledgments.map((a: any) =>
      typeof a.policyId === "object" ? a.policyId?._id : a.policyId
    )
  );

  const paginationMeta = policiesData?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Policies & Compliance
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              Corporate Governance
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enforce corporate code of conduct, information security standards, and electronic employee acknowledgments.
          </p>
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

          {isHrOrAdmin && (
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Draft New Policy
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <PolicyStatsCards
        policies={policies}
        myAcknowledgments={myAcknowledgments}
        isLoading={isLoading}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search policy code, title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Status Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {STATUS_TABS.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Policy Table */}
      <PolicyTable
        policies={policies}
        isLoading={isLoading}
        onView={(policy) => setSelectedForDetail(policy)}
        onEdit={isHrOrAdmin ? (policy) => setSelectedForEdit(policy) : undefined}
        onViewCompliance={
          isHrOrAdmin ? (policy) => setSelectedForCompliance(policy) : undefined
        }
        signedPolicyIds={signedPolicyIds}
        isHrOrAdmin={isHrOrAdmin}
        currentPage={currentPage}
        totalItems={paginationMeta.total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={setItemsPerPage}
      />

      {/* Modal: Draft New Policy */}
      <CreatePolicyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Modal: Edit Policy Terms */}
      <EditPolicyModal
        isOpen={!!selectedForEdit}
        onClose={() => setSelectedForEdit(null)}
        policy={selectedForEdit}
      />

      {/* Modal: View Policy Document & Digital Sign */}
      <PolicyDetailModal
        isOpen={!!selectedForDetail}
        onClose={() => setSelectedForDetail(null)}
        policy={selectedForDetail}
        hasAcknowledged={
          selectedForDetail
            ? selectedForDetail.hasAcknowledged ||
              signedPolicyIds.has(selectedForDetail._id)
            : false
        }
      />

      {/* Modal: Organizational Compliance Audit Report */}
      <ComplianceReportModal
        isOpen={!!selectedForCompliance}
        onClose={() => setSelectedForCompliance(null)}
        policy={selectedForCompliance}
      />
    </div>
  );
}
