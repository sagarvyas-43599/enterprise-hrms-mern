"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetLeavesQuery, useReviewLeaveMutation } from "@/redux/services/leaveApi";
import { useGetAuditLogsQuery } from "@/redux/services/auditLogApi";
import { useGetTicketsQuery } from "@/redux/services/ticketApi";
import { Check, X, Clock, Activity, Search, Command, ArrowRight, UserCircle, Briefcase, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const PendingInboxWidget = () => {
  const { data: leavesData, refetch } = useGetLeavesQuery({ status: "PENDING" as any, limit: 5 });
  const [reviewLeave] = useReviewLeaveMutation();

  const leaves = leavesData?.data || [];

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewLeave({ id, body: { status, remarks: "Actioned via quick inbox" } }).unwrap();
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      refetch();
    } catch (err: any) {
      toast.error(err.data?.message || "Action failed");
    }
  };

  if (leaves.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-center items-center text-center space-y-3">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Check className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inbox Zero</h3>
          <p className="text-xs text-slate-500 mt-1">You have no pending approvals in your queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Manager Approval Inbox
        </h3>
        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {leaves.length} Pending
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto max-h-[300px]">
        {leaves.map((leave: any) => (
          <div key={leave._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {leave.employeeId?.firstName || "Unknown"} {leave.employeeId?.lastName || "Employee"}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  {leave.leaveType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-rose-200 text-rose-600 hover:bg-rose-50" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => handleAction(leave._id, "REJECTED")}>
                Deny
              </Button>
              <Button size="sm" variant="primary" className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => handleAction(leave._id, "APPROVED")}>
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Link href="/leaves" className="p-3 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        View Full Inbox
      </Link>
    </div>
  );
};

export const ActivityFeedWidget = () => {
  const { data: auditData } = useGetAuditLogsQuery({ limit: 5 });
  const logs = auditData?.data || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
        <Activity className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Audit Stream</h3>
      </div>
      <div className="p-4 space-y-4 flex-1">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No recent activity detected.</p>
        ) : (
          logs.map((log: any) => (
            <div key={log._id} className="flex gap-3">
              <div className="mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20" />
              </div>
              <div>
                <p className="text-xs text-slate-800 dark:text-slate-200">
                  <span className="font-bold">{log.actorName || "System"}</span> {log.action} <span className="font-medium text-slate-500">{log.targetEntity}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <Link href="/audit-logs" className="p-3 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 mt-auto">
        View Security Trail
      </Link>
    </div>
  );
};

export const GlobalSearchWidget = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      toast.info(`Searching enterprise directory for "${query}"...`);
      // In a real app, this might navigate to a global search page or open a command palette.
      // For now, let's redirect to employees with search param if possible, or just clear.
      router.push(`/employees?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Global search employees, tickets, policies... (Cmd+K)"
          className="block w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Command className="w-3 h-3" /> K
          </div>
        </div>
      </form>
    </div>
  );
};
