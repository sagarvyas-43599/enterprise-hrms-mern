"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendAnalysisCardProps {
  trendData?: any[];
  isLoading?: boolean;
}

export const TrendAnalysisCard: React.FC<TrendAnalysisCardProps> = ({
  trendData = [],
  isLoading = false,
}) => {
  // Placeholder data if no trendData provided
  const defaultData = [
    { month: "Jan", tickets: 40, expenses: 2400 },
    { month: "Feb", tickets: 30, expenses: 1398 },
    { month: "Mar", tickets: 20, expenses: 9800 },
    { month: "Apr", tickets: 27, expenses: 3908 },
    { month: "May", tickets: 18, expenses: 4800 },
    { month: "Jun", tickets: 23, expenses: 3800 },
    { month: "Jul", tickets: 34, expenses: 4300 },
  ];

  const data = trendData.length > 0 ? trendData : defaultData;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              6-Month Organizational Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Correlating helpdesk volume vs overhead expenses
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickFormatter={(val) => new Intl.NumberFormat('en-IN', { notation: "compact", maximumFractionDigits: 1 }).format(val)}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses (₹)"
              />
              <Area
                type="monotone"
                dataKey="tickets"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTickets)"
                name="Tickets Raised"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
