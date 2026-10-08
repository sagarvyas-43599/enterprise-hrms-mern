"use client";

import React, { useState } from "react";
import {
  BarChart3,
  RefreshCw,
  Printer,
  Calendar,
  Download,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ExecutiveKpiCards } from "@/features/reports/components/ExecutiveKpiCards";
import { DepartmentSpendBarChart } from "@/features/reports/components/DepartmentSpendBarChart";
import { WorkforceAnalyticsCard } from "@/features/reports/components/WorkforceAnalyticsCard";
import { AssetsAndTicketsCard } from "@/features/reports/components/AssetsAndTicketsCard";
import { PerformanceRatingsCard } from "@/features/reports/components/PerformanceRatingsCard";
import { TrendAnalysisCard } from "@/features/reports/components/TrendAnalysisCard";
import { DrillDownModal } from "@/features/reports/components/DrillDownModal";
import { useGetExecutiveSummaryQuery } from "@/redux/services/reportApi";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";

const DATE_RANGES = [
  { value: "ALL", label: "Full Corporate Lifetime" },
  { value: "YTD", label: "Fiscal Year 2026-27" },
  { value: "Q3", label: "Current Quarter (Q3)" },
  { value: "MONTH", label: "Current Month" },
];

export default function ReportsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [selectedRange, setSelectedRange] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [drillDownType, setDrillDownType] = useState<string | null>(null);
  
  const deptDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryParams = React.useMemo(() => {
    const today = new Date();
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    if (selectedRange === "MONTH") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = firstDay.toISOString();
      endDate = today.toISOString();
    } else if (selectedRange === "Q3") {
      // Assuming fiscal Q3 is roughly Oct 1 to Dec 31
      const firstDay = new Date(today.getFullYear(), 9, 1);
      const lastDay = new Date(today.getFullYear(), 11, 31);
      startDate = firstDay.toISOString();
      endDate = lastDay.toISOString();
    } else if (selectedRange === "YTD") {
      // Assuming fiscal year starts April 1
      const currentMonth = today.getMonth();
      const startYear = currentMonth >= 3 ? today.getFullYear() : today.getFullYear() - 1;
      const firstDay = new Date(startYear, 3, 1);
      startDate = firstDay.toISOString();
      endDate = today.toISOString();
    }

    return { startDate, endDate, departmentCode: selectedDepartment };
  }, [selectedRange, selectedDepartment]);

  const { data, isLoading, refetch, isFetching } = useGetExecutiveSummaryQuery(queryParams);

  const reportData = data?.data;
  const kpis = reportData?.kpiSummary;
  const charts = reportData?.charts;
  const departments = reportData?.departments || [];

  const handlePrint = () => {
    window.print();
  };

  const handleExportQuickCSV = (type: string) => {
    toast.success(`Preparing ${type} export data spreadsheet...`);
    
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `export-${new Date().toISOString().split("T")[0]}.csv`;

    if (type === "Executive Summary") {
      headers = ["Metric", "Value"];
      rows = [
        ["Total Workforce Headcount", kpis?.totalHeadcount || 0],
        ["Monthly Disbursed Payroll Net", kpis?.monthlyNetPayroll || 0],
        ["Hardware Capital Valuation", kpis?.totalAssetValuation || 0],
        ["Today Attendance Presence Rate", `${kpis?.attendanceRatePercent || 0}%`],
        ["Helpdesk Resolved Tickets", kpis?.resolvedTicketsCount || 0],
        ["Helpdesk Active Tickets", kpis?.openTicketsCount || 0],
        ["Published Corporate Policies", kpis?.publishedPolicies || 0],
        ["Employee Policy Signatures", kpis?.totalAcknowledgments || 0],
      ];
      filename = `executive-bi-report-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (type === "Payroll Summary") {
      headers = ["Payroll Status", "Count", "Total Gross (₹)", "Total Net (₹)", "Total Deductions (₹)"];
      rows = (charts?.payrollByStatus || []).map((p: any) => [
        p._id || "Unknown",
        p.count || 0,
        p.totalGross || 0,
        p.totalNet || 0,
        p.totalDeductions || 0
      ]);
      filename = `payroll-ledger-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (type === "Attendance Log") {
      headers = ["Attendance Status", "Employee Count Today"];
      rows = (charts?.attendanceBreakdown || []).map((a: any) => [
        a._id || "Unknown",
        a.count || 0
      ]);
      filename = `attendance-ledger-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (type === "Hardware Assets") {
      headers = ["Asset Category", "Total Count", "Total Valuation (₹)"];
      rows = (charts?.assetsByCategory || []).map((a: any) => [
        a._id || "Unknown",
        a.count || 0,
        a.totalCost || 0
      ]);
      filename = `hardware-assets-ledger-${new Date().toISOString().split("T")[0]}.csv`;
    }

    if (rows.length === 0) {
      headers = ["Notice"];
      rows = [["No data available for this export"]];
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Executive BI Analytics & Reports
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              C-Suite Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time cross-module organizational intelligence, payroll expenditure, attendance health, and talent KPIs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportQuickCSV("Executive Summary")}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            }
          >
            Live Refresh
          </Button>
        </div>
      </div>

      {/* Date Range Selector Pill Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div ref={deptDropdownRef} className="relative flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4">
            <Building2 className="w-4 h-4 text-indigo-500" />
            
            <div 
              className="flex items-center gap-1 cursor-pointer select-none"
              onClick={() => setIsDeptOpen(!isDeptOpen)}
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {selectedDepartment === "ALL" ? "All Departments" : selectedDepartment}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isDeptOpen ? "rotate-180" : ""}`} />
            </div>

            {isDeptOpen && (
              <div className="absolute top-full mt-2 left-0 w-48 max-h-64 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                <div 
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedDepartment("ALL");
                    setIsDeptOpen(false);
                  }}
                >
                  All Departments
                </div>
                {departments.map((d) => (
                  <div 
                    key={d.id} 
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedDepartment(d.name);
                      setIsDeptOpen(false);
                    }}
                  >
                    {d.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Period:
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedRange === range.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <ExecutiveKpiCards kpis={kpis} isLoading={isLoading} onDrillDown={(type) => setDrillDownType(type)} />

      {/* Organizational Trends Chart (Full Width) */}
      <TrendAnalysisCard trendData={charts?.trendData} isLoading={isLoading} />

      {/* Primary Analytics Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Department Budget & Performance */}
        <div className="space-y-6">
          <DepartmentSpendBarChart
            departments={departments}
            isLoading={isLoading}
          />

          <PerformanceRatingsCard
            performanceRatingCurve={charts?.performanceRatingCurve}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Attendance / Leaves & Hardware Assets / Tickets */}
        <div className="space-y-6">
          <WorkforceAnalyticsCard
            attendanceBreakdown={charts?.attendanceBreakdown}
            leavesByStatus={charts?.leavesByStatus}
            leavesByType={charts?.leavesByType}
            isLoading={isLoading}
          />

          <AssetsAndTicketsCard
            assetsByCategory={charts?.assetsByCategory}
            ticketsByPriority={charts?.ticketsByPriority}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Bottom Export Studio Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-slate-900 dark:to-indigo-950 text-white rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Executive Data Studio & Scheduled Reports
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Generate itemized datasets for board presentations, external compliance audits, and taxation filings.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => handleExportQuickCSV("Payroll Summary")}
            className="bg-white/10 hover:bg-white/20 text-white border-0 text-xs"
          >
            Payroll Ledger
          </Button>
          <Button
            size="sm"
            onClick={() => handleExportQuickCSV("Attendance Log")}
            className="bg-white/10 hover:bg-white/20 text-white border-0 text-xs"
          >
            Attendance Ledger
          </Button>
          <Button
            size="sm"
            onClick={() => handleExportQuickCSV("Hardware Assets")}
            className="bg-white/10 hover:bg-white/20 text-white border-0 text-xs"
          >
            Hardware Assets
          </Button>
        </div>
      </div>

      <DrillDownModal 
        isOpen={!!drillDownType} 
        onClose={() => setDrillDownType(null)} 
        type={drillDownType} 
      />
    </div>
  );
}
