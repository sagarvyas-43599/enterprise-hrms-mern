"use client";

import React from "react";
import {
  ShieldCheck,
  Clock,
  Terminal,
  User,
  Globe,
  Tag,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import {
  AuditLog,
  getActionBadgeClass,
  getEntityBadgeClass,
  formatActionText,
} from "../types/auditLog.types";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  onInspect: (log: AuditLog) => void;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  isLoading,
  onInspect,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-8">
        <div className="space-y-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No Audit Security Logs Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No compliance audit trail matches your selected filter criteria. Try clearing search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Event Timestamp</th>
                <th className="py-3.5 px-4">Actor Email</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Network / IP</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {logs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-slate-800 dark:text-slate-200 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span className="text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Actor */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {log.actorEmail || "System Automation"}
                        </div>
                        {log.actorId && (
                          <div className="font-mono text-[10px] text-slate-400">
                            {log.actorId.slice(-6)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border ${getActionBadgeClass(
                        log.action
                      )}`}
                    >
                      {formatActionText(log.action)}
                    </span>
                  </td>

                  {/* Entity Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getEntityBadgeClass(
                          log.entity
                        )}`}
                      >
                        {formatActionText(log.entity)}
                      </span>
                      {log.entityId && (
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[80px]">
                          #{log.entityId.slice(-6)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Network IP & User Agent */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {log.ipAddress === "unknown" ? "127.0.0.1" : (log.ipAddress || "127.0.0.1")}
                    </div>
                    {log.userAgent && log.userAgent !== "unknown" && log.userAgent !== "Unknown Device" && (
                      <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[140px]" title={log.userAgent}>
                        {log.userAgent}
                      </div>
                    )}
                  </td>

                  {/* Inspect Details Button */}
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onInspect(log)}
                      title="Inspect Event Payload"
                      className="h-8 w-8 p-0"
                    >
                      <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      {/* Pagination Controls */}
      {total > 0 && onPageChange && onLimitChange && (
        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};
