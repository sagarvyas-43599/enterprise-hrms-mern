"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Clock,
  ExternalLink,
  Trash2,
  Users,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  AppNotification,
  getTypeMetadata,
  getPriorityBadgeClass,
} from "../types/notification.types";

interface NotificationListProps {
  notifications: AppNotification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  isMarkingRead?: boolean;
  isDeleting?: boolean;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications = [],
  isLoading = false,
  onMarkAsRead,
  onDelete,
  isMarkingRead = false,
  isDeleting = false,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 50,
  onPageChange,
  onLimitChange,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bell className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Inbox Is Clear & Caught Up
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No notifications match your current filter. You will be alerted when new updates or announcements arrive.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => {
        const typeMeta = getTypeMetadata(n.type);

        return (
          <div
            key={n._id}
            className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              !n.isRead
                ? "bg-indigo-50/25 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              {/* Unread Indicator Dot */}
              <div className="pt-1.5 shrink-0">
                {!n.isRead ? (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
                  </span>
                ) : (
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeMeta.badgeClass}`}
                  >
                    {typeMeta.label}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] border ${getPriorityBadgeClass(
                      n.priority
                    )}`}
                  >
                    {n.priority}
                  </span>

                  {n.targetRole && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Users className="w-2.5 h-2.5" />
                      Role: {n.targetRole.replace("_", " ")}
                    </span>
                  )}

                  {n.targetDepartment && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Building className="w-2.5 h-2.5" />
                      Dept: {n.targetDepartment}
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 ml-auto sm:ml-0">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(n.createdAt)}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {n.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {n.message}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  <span>From: {n.senderName || "Corporate Administration"}</span>
                  {n.readAt && (
                    <span>• Read on {new Date(n.readAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {n.actionLink && (
                <Link href={n.actionLink}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs px-2.5 whitespace-nowrap"
                    leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Record
                  </Button>
                </Link>
              )}

              {!n.isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkAsRead(n._id)}
                  disabled={isMarkingRead}
                  className="h-8 text-xs px-2.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 whitespace-nowrap"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Mark as Read
                </Button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(n._id)}
                  disabled={isDeleting}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                  title="Dismiss or delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Pagination Footer */}
      {!isLoading && notifications.length > 0 && onPageChange && onLimitChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 gap-4 mt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs"
              >
                Prev
              </Button>
              <div className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                {currentPage}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage * itemsPerPage >= totalItems}
                className="h-7 px-2 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
