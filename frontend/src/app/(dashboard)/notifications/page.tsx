"use client";

import React, { useState } from "react";
import {
  Bell,
  RefreshCw,
  CheckCheck,
  Megaphone,
  Search,
  Filter,
  Trash2,
  Download,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationStatsCards } from "@/features/notifications/components/NotificationStatsCards";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { BroadcastAnnouncementModal } from "@/features/notifications/components/BroadcastAnnouncementModal";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllReadNotificationsMutation,
} from "@/redux/services/notificationApi";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";

type FilterTab = "ALL" | "UNREAD" | "ANNOUNCEMENTS" | "URGENT";

export default function NotificationsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);

  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab, selectedType, selectedPriority, limit]);

  const isHrOrAdmin =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  // Polling every 30 seconds for live corporate updates
  const { data, isLoading, refetch, isFetching } = useGetNotificationsQuery(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
      status: activeTab === "UNREAD" ? "unread" : "all",
      type: selectedType !== "ALL" ? (selectedType as any) : undefined,
      priority: selectedPriority !== "ALL" ? (selectedPriority as any) : undefined,
    },
    { pollingInterval: 30000 }
  );

  const [markAsRead, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [clearAllRead, { isLoading: isClearingRead }] = useClearAllReadNotificationsMutation();

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;
  const readCount = notifications.length - unreadCount;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to update notification status");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read!");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      toast.success("Notification removed from inbox");
    } catch {
      toast.error("Failed to remove notification");
    }
  };

  const handleClearRead = async () => {
    try {
      await clearAllRead().unwrap();
      toast.success("All read notifications cleared from inbox");
    } catch {
      toast.error("Failed to clear read notifications");
    }
  };

  // Export notifications log as CSV for audit compliance
  const handleExportCSV = () => {
    if (notifications.length === 0) {
      toast.info("No notification records to export");
      return;
    }

    const headers = ["Title", "Message", "Category", "Priority", "Status", "Sender", "Date"];
    const rows = filteredNotifications.map((n) => [
      `"${n.title.replace(/"/g, '""')}"`,
      `"${n.message.replace(/"/g, '""')}"`,
      n.type,
      n.priority,
      n.isRead ? "READ" : "UNREAD",
      `"${(n.senderName || "System").replace(/"/g, '""')}"`,
      new Date(n.createdAt).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HRMS_Notifications_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Notifications log downloaded as CSV");
  };

  // Filter & Search logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ANNOUNCEMENTS" && n.type !== "ANNOUNCEMENT" && n.type !== "POLICY_MANDATE") return false;
    if (activeTab === "URGENT" && n.priority !== "URGENT" && n.priority !== "HIGH") return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Notification Center & Broadcasts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time corporate updates, approval alerts, payroll notices, and company circulars.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="h-9 px-3"
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            >
              Mark All Read
            </Button>
          )}

          {readCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
              disabled={isClearingRead}
              className="h-9 px-3 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400"
              title="Clear all read notifications"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Read ({readCount})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 px-3"
            title="Download CSV export"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3"
            title="Refresh feed"
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
              onClick={() => setIsBroadcastOpen(true)}
              className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              leftIcon={<Megaphone className="w-4 h-4" />}
            >
              Broadcast Announcement
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards - Interactive click filtering */}
      <NotificationStatsCards
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isLoading}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Main Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("UNREAD")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "UNREAD"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("ANNOUNCEMENTS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "ANNOUNCEMENTS"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Broadcasts
            </button>
            <button
              onClick={() => setActiveTab("URGENT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "URGENT"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Urgent & High
            </button>
          </div>

          {/* Secondary Filters & Search Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Categories</option>
              <option value="ANNOUNCEMENT">Company Broadcasts</option>
              <option value="ALERT">Security / Alerts</option>
              <option value="LEAVE_UPDATE">Leave Updates</option>
              <option value="PAYROLL_GENERATED">Payroll Notices</option>
              <option value="POLICY_MANDATE">Policy Mandates</option>
              <option value="TICKET_UPDATE">Support Tickets</option>
              <option value="GENERAL">General Notices</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts, text..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Notification List Feed */}
      <NotificationList
        notifications={filteredNotifications}
        isLoading={isLoading || isFetching}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
        isMarkingRead={isMarkingRead}
        isDeleting={isDeleting}
        currentPage={page}
        totalItems={data?.data?.meta?.total || 0}
        itemsPerPage={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {/* Modal: Broadcast Announcement */}
      <BroadcastAnnouncementModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />
    </div>
  );
}
