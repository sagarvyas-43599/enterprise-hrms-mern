"use client";

import React from "react";
import { Bell, AlertTriangle, Megaphone, CheckCircle2 } from "lucide-react";
import { AppNotification } from "../types/notification.types";

interface NotificationStatsCardsProps {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading?: boolean;
  activeTab?: string;
  onSelectTab?: (tab: "ALL" | "UNREAD" | "ANNOUNCEMENTS" | "URGENT") => void;
}

export const NotificationStatsCards: React.FC<NotificationStatsCardsProps> = ({
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  activeTab = "ALL",
  onSelectTab,
}) => {
  const total = notifications.length;
  const broadcasts = notifications.filter(
    (n) => n.type === "ANNOUNCEMENT" || n.type === "POLICY_MANDATE"
  ).length;
  const urgentCount = notifications.filter(
    (n) => n.priority === "URGENT" || n.priority === "HIGH"
  ).length;

  const cards: Array<{
    id: "ALL" | "UNREAD" | "ANNOUNCEMENTS" | "URGENT";
    label: string;
    value: string;
    subtext: string;
    icon: React.ReactNode;
    bgIcon: string;
  }> = [
    {
      id: "ALL",
      label: "Total Notifications",
      value: total.toString(),
      subtext: "System events, status changes & notices",
      icon: <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bgIcon: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "UNREAD",
      label: "Unread Pending",
      value: unreadCount.toString(),
      subtext: unreadCount > 0 ? "Requires your immediate attention" : "Inbox fully caught up",
      icon: <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    },
    {
      id: "ANNOUNCEMENTS",
      label: "Company Broadcasts",
      value: broadcasts.toString(),
      subtext: "Official organization circulars",
      icon: <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
    {
      id: "URGENT",
      label: "Urgent Priority",
      value: urgentCount.toString(),
      subtext: "Critical compliance / workflow escalations",
      icon: <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bgIcon: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isSelected = activeTab === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectTab && onSelectTab(card.id)}
            className={`rounded-2xl p-5 border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
              isSelected
                ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                {card.label}
              </span>
              <div
                className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${card.bgIcon}`}
              >
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {card.value}
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
                {card.subtext}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
