"use client";

import React from "react";
import {
  LifeBuoy,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Ticket, TicketMetrics } from "../types/ticket.types";

interface TicketStatsCardsProps {
  tickets?: Ticket[];
  metrics?: TicketMetrics;
  isLoading?: boolean;
}

export const TicketStatsCards: React.FC<TicketStatsCardsProps> = ({
  tickets = [],
  metrics,
  isLoading = false,
}) => {
  const total = metrics?.totalTickets ?? metrics?.total ?? tickets.length;
  const openCount =
    metrics?.open ?? tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount =
    metrics?.inProgress ??
    tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount =
    (metrics?.resolved ??
      tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED")
        .length) + (metrics?.closed || 0);

  const urgentCount =
    metrics?.urgent ??
    tickets.filter((t) => t.priority === "URGENT" && t.status !== "CLOSED")
      .length;

  const cards = [
    {
      label: "Total Service Tickets",
      value: total.toString(),
      subtext: `${urgentCount} marked urgent SLA priority`,
      icon: <LifeBuoy className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Open / Awaiting Triage",
      value: openCount.toString(),
      subtext: "Pending initial support assignment",
      icon: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Active In-Progress",
      value: inProgressCount.toString(),
      subtext: "Under active investigation by IT / HR",
      icon: <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon:
        "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Resolved & Closed",
      value: resolvedCount.toString(),
      subtext: "Concluded with resolution remarks",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {card.label}
            </span>
            <div
              className={`w-10 h-10 rounded-xl ${card.bgIcon} flex items-center justify-center shrink-0`}
            >
              {card.icon}
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </h3>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
