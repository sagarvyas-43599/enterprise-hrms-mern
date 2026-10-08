"use client";

import React from "react";
import { Target, Award, Star } from "lucide-react";

interface PerformanceRatingsCardProps {
  performanceRatingCurve?: { _id: string; count: number }[];
  isLoading?: boolean;
}

export const PerformanceRatingsCard: React.FC<PerformanceRatingsCardProps> = ({
  performanceRatingCurve = [],
  isLoading = false,
}) => {
  const totalRatings =
    performanceRatingCurve.reduce((sum, r) => sum + r.count, 0) || 1;

  const ratingMetadata: Record<string, { label: string; color: string; stars: number }> = {
    OUTSTANDING: { label: "Outstanding (Top 10%)", color: "bg-purple-500", stars: 5 },
    EXCEEDS_EXPECTATIONS: { label: "Exceeds Expectations", color: "bg-indigo-500", stars: 4 },
    MEETS_EXPECTATIONS: { label: "Meets Expectations (Core)", color: "bg-emerald-500", stars: 3 },
    NEEDS_IMPROVEMENT: { label: "Needs Improvement", color: "bg-amber-500", stars: 2 },
    UNSATISFACTORY: { label: "Unsatisfactory / PIP", color: "bg-rose-500", stars: 1 },
  };

  const defaultKeys = [
    "OUTSTANDING",
    "EXCEEDS_EXPECTATIONS",
    "MEETS_EXPECTATIONS",
    "NEEDS_IMPROVEMENT",
    "UNSATISFACTORY",
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Talent Performance & Appraisal Bell Curve
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Corporate evaluation rating distributions
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {defaultKeys.map((key) => {
          const item = performanceRatingCurve.find((r) => r._id === key);
          const count = item?.count || 0;
          const meta = ratingMetadata[key];
          const percent = Math.round((count / totalRatings) * 100);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(meta.stars)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {count} employees
                  </span>
                  <span className="text-[11px] text-slate-400">({percent}%)</span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${meta.color} transition-all duration-700`}
                  style={{ width: `${Math.max(count > 0 ? percent : 2, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
