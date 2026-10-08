"use client";

import React from "react";
import { Laptop, LifeBuoy, AlertTriangle, Package } from "lucide-react";

interface AssetsAndTicketsCardProps {
  assetsByCategory?: { _id: string; count: number; totalCost: number }[];
  ticketsByPriority?: { _id: string; count: number }[];
  isLoading?: boolean;
}

export const AssetsAndTicketsCard: React.FC<AssetsAndTicketsCardProps> = ({
  assetsByCategory = [],
  ticketsByPriority = [],
  isLoading = false,
}) => {
  const priorityColors: Record<string, { bg: string; text: string }> = {
    URGENT: { bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-600 dark:text-rose-400" },
    HIGH: { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-600 dark:text-orange-400" },
    MEDIUM: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
    LOW: { bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-600 dark:text-slate-400" },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Hardware Asset Inventory Allocation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hardware Capital by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Procured devices and capital investment
            </p>
          </div>
        </div>

        {assetsByCategory.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            No hardware inventory assets registered.
          </div>
        ) : (
          <div className="space-y-2">
            {assetsByCategory.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cat._id.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{cat.totalCost.toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-[11px]">({cat.count} units)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpdesk Tickets by Severity */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Support Ticket Severity SLA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active query breakdown by urgency
            </p>
          </div>
        </div>

        {ticketsByPriority.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            No active support tickets logged.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {ticketsByPriority.map((item) => {
              const theme =
                priorityColors[item._id] || {
                  bg: "bg-slate-500/10 border-slate-500/20",
                  text: "text-slate-500",
                };
              return (
                <div
                  key={item._id}
                  className={`p-3 rounded-xl border ${theme.bg}`}
                >
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className={`w-3.5 h-3.5 ${theme.text}`} />
                    <span className={`text-xs font-bold ${theme.text}`}>
                      {item._id}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {item.count} tickets
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
