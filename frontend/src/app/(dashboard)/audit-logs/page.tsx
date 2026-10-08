"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Lock,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuditStatsCards } from "@/features/audit-logs/components/AuditStatsCards";
import { AuditLogTable } from "@/features/audit-logs/components/AuditLogTable";
import { AuditLogDetailModal } from "@/features/audit-logs/components/AuditLogDetailModal";
import {
  useGetAuditLogsQuery,
  useGetAuditLogStatsQuery,
} from "@/redux/services/auditLogApi";
import { useAppSelector } from "@/redux/hooks";
import { AuditLog } from "@/features/audit-logs/types/auditLog.types";

const ACTION_OPTIONS = [
  { value: "ALL", label: "All Actions" },
  { value: "AUTH_LOGIN", label: "Authentication & Logins" },
  { value: "CREATE", label: "Creation Events" },
  { value: "UPDATE", label: "Updates & Modifications" },
  { value: "DELETE", label: "Deletions & Archivals" },
  { value: "STATUS_CHANGE", label: "Workflow Status Changes" },
];

const ENTITY_OPTIONS = [
  { value: "ALL", label: "All Target Entities" },
  { value: "USER", label: "Users & Credentials" },
  { value: "EMPLOYEE", label: "Employee Profiles" },
  { value: "DEPARTMENT", label: "Departments & Designations" },
  { value: "LEAVE", label: "Leave Requests" },
  { value: "PAYROLL", label: "Payroll & CTC" },
  { value: "ASSET", label: "Hardware Inventory Assets" },
  { value: "POLICY", label: "Corporate Policies" },
  { value: "TICKET", label: "Helpdesk Tickets" },
];

export default function AuditLogsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const isAuthorized =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  // RTK Query: fetch audit logs with filters & pagination
  const {
    data: logsData,
    isLoading: isLogsLoading,
    refetch: refetchLogs,
    isFetching,
  } = useGetAuditLogsQuery(
    {
      search: debouncedSearch.trim() || undefined,
      action: selectedAction !== "ALL" ? selectedAction : undefined,
      entity: selectedEntity !== "ALL" ? selectedEntity : undefined,
      page,
      limit,
    },
    { skip: !isAuthorized }
  );

  // RTK Query: fetch aggregate audit stats
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } =
    useGetAuditLogStatsQuery(undefined, { skip: !isAuthorized });

  const handleRefresh = () => {
    refetchLogs();
    refetchStats();
  };

  const handleExportCSV = () => {
    if (!logsData?.data || logsData.data.length === 0) return;
    const headers = ["Timestamp", "Actor Email", "Action", "Entity", "Entity ID", "IP Address"];
    const rows = logsData.data.map((l) => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.actorEmail || ""}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.entityId || ""}"`,
      `"${l.ipAddress || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-trail-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthorized) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto mt-16 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Restricted Security Zone
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          The corporate audit trail contains sensitive SOC 2 and regulatory access logs. Only Super Administrators and HR Executives are authorized to access this ledger.
        </p>
      </div>
    );
  }

  const logs = logsData?.data || [];
  const meta = logsData?.meta || { total: 0, page: 1, limit: 5, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Audit Security Trail
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
              SOC 2 / ISO 27001
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable organizational compliance ledger tracking user authentications, resource modifications, and security events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="h-9 px-3"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="h-9 px-3"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />}
          >
            Live Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <AuditStatsCards
        stats={statsData?.data}
        isLoading={isStatsLoading}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search actor email, action, entity, IP..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Action Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {ACTION_OPTIONS.map((act) => (
                  <option key={act.value} value={act.value}>
                    {act.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Filter Dropdown */}
            <select
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {ENTITY_OPTIONS.map((ent) => (
                <option key={ent.value} value={ent.value}>
                  {ent.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <AuditLogTable
        logs={logs}
        isLoading={isLogsLoading}
        onInspect={(log) => setSelectedLog(log)}
        page={page}
        totalPages={meta.totalPages}
        total={meta.total}
        limit={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {/* Modal: Audit Event Inspector */}
      <AuditLogDetailModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}
