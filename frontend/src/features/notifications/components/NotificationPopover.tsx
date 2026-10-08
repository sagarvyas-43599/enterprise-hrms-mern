"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Inbox,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  AppNotification,
} from "@/redux/services/notificationApi";
import {
  getTypeMetadata,
  getPriorityBadgeClass,
} from "../types/notification.types";
import { toast } from "sonner";

type PopoverTab = "ALL" | "UNREAD" | "ANNOUNCEMENTS";

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
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const NotificationPopover: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PopoverTab>("ALL");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Poll notifications every 30 seconds for live updates
  const { data, refetch, isFetching } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });

  const [markAsRead, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleMarkItemRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleItemClick = async (item: AppNotification) => {
    if (!item.isRead) {
      await markAsRead(item._id);
    }
    setIsOpen(false);
    if (item.actionLink) {
      router.push(item.actionLink);
    }
  };

  // Filter items for tabs
  const tabItems = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "ANNOUNCEMENTS") return n.type === "ANNOUNCEMENT" || n.type === "POLICY_MANDATE";
    return true;
  });

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 rounded-xl transition-all relative ${
          isOpen
            ? "bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
        }`}
        title="Notifications Center"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-ping rounded-full bg-rose-400 opacity-40 pointer-events-none" />
          </>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[360px] sm:w-[420px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[580px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                activeTab === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("UNREAD")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                activeTab === "UNREAD"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("ANNOUNCEMENTS")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                activeTab === "ANNOUNCEMENTS"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Broadcasts
            </button>
          </div>

          {/* Notifications Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {tabItems.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activeTab === "UNREAD"
                    ? "Inbox Caught Up!"
                    : "No notifications in this view"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  {activeTab === "UNREAD"
                    ? "You have acknowledged all pending alerts."
                    : "Check back later for company updates."}
                </p>
              </div>
            ) : (
              tabItems.slice(0, 8).map((item) => {
                const typeMeta = getTypeMetadata(item.type);

                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start gap-3 relative group ${
                      !item.isRead
                        ? "bg-indigo-50/20 dark:bg-indigo-950/15"
                        : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    {/* Unread indicator */}
                    <div className="pt-1 shrink-0">
                      {!item.isRead ? (
                        <span className="block w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950/60" />
                      ) : (
                        <span className="block w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${typeMeta.badgeClass}`}
                          >
                            {typeMeta.label}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] border ${getPriorityBadgeClass(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold leading-tight truncate ${
                          !item.isRead
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                        {item.message}
                      </p>

                      {item.senderName && (
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          From: {item.senderName}
                        </p>
                      )}
                    </div>

                    {/* Action buttons on hover */}
                    <div className="shrink-0 flex items-center gap-1 self-center">
                      {!item.isRead && (
                        <button
                          onClick={(e) => handleMarkItemRead(item._id, e)}
                          disabled={isMarkingRead}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {item.actionLink && (
                        <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs font-semibold">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <span>View All in Notification Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <span className="text-[10px] text-slate-400">
              Auto-syncs live
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
