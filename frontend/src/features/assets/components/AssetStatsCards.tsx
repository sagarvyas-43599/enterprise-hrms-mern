"use client";

import React from "react";
import {
  Laptop,
  CheckCircle2,
  Wrench,
  DollarSign,
  Package,
} from "lucide-react";
import { Asset, AssetMetrics } from "../types/asset.types";

interface AssetStatsCardsProps {
  assets?: Asset[];
  metrics?: AssetMetrics;
  isLoading?: boolean;
}

export const AssetStatsCards: React.FC<AssetStatsCardsProps> = ({
  assets = [],
  metrics,
  isLoading = false,
}) => {
  const totalAssets = metrics?.totalCount ?? assets.length;
  const allocated =
    metrics?.allocated ??
    assets.filter((a) => a.status === "ALLOCATED").length;
  const available =
    metrics?.available ??
    assets.filter((a) => a.status === "AVAILABLE").length;
  const underRepair =
    metrics?.underRepair ??
    assets.filter((a) => a.status === "UNDER_REPAIR").length;

  const totalValuation =
    metrics?.totalValue ??
    assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

  const cards = [
    {
      label: "Total Inventory Valuation",
      value: `$${totalValuation.toLocaleString()}`,
      subtext: `${totalAssets} managed corporate hardware assets`,
      icon: <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgIcon: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Allocated to Staff",
      value: allocated.toString(),
      subtext: "Assigned for remote / office operations",
      icon: <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    },
    {
      label: "In Stock (Available)",
      value: available.toString(),
      subtext: "Ready for immediate staff provisioning",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Under Maintenance",
      value: underRepair.toString(),
      subtext: "Hardware service / warranty repair",
      icon: <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
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
