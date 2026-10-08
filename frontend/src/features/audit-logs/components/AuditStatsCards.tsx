"use client";

import React from "react";
import {
  ShieldCheck,
  Activity,
  Users,
  Clock,
  KeyRound,
  FileCheck2,
} from "lucide-react";
import { AuditLogStats, formatActionText } from "../types/auditLog.types";

interface AuditStatsCardsProps {
  stats?: AuditLogStats;
  isLoading?: boolean;
}

export const AuditStatsCards: React.FC<AuditStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const totalEvents = stats?.totalEvents ?? 0;
  const todayEvents = stats?.todayEvents ?? 0;
  const uniqueActors = stats?.totalUniqueActors ?? 0;

  const topAction =
    stats?.topActions && stats.topActions.length > 0
      ? `${formatActionText(stats.topActions[0]._id)} (${stats.topActions[0].count})`
      : "Auth Login";

  const cards = [
    {
      label: "Total Audit Events",
      value: totalEvents.toString(),
      subtext: "Cryptographically verified security logs",
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bgIcon: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Today's Activity Stream",
      value: todayEvents.toString(),
      subtext: "Operational actions executed today",
      icon: <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Active System Actors",
      value: uniqueActors.toString(),
      subtext: "Unique administrators & employees logged",
      icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Primary Operation",
      value: topAction,
      subtext: "Most frequent compliance audit event",
      icon: <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              {card.label}
            </span>
            <div className={`p-2.5 rounded-xl ${card.bgIcon}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            ) : (
              <div className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                {card.value}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
