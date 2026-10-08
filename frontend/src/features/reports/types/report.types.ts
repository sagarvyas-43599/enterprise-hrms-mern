export interface KpiSummary {
  totalHeadcount: number;
  attendanceRatePercent: number;
  monthlyGrossPayroll: number;
  monthlyNetPayroll: number;
  totalAssetValuation: number;
  totalAssetsCount: number;
  openTicketsCount: number;
  resolvedTicketsCount: number;
  approvedLeavesCount: number;
  pendingLeavesCount: number;
  publishedPolicies: number;
  totalAcknowledgments: number;
}

export interface DepartmentSummary {
  id: string;
  code: string;
  name: string;
  annualBudget: number;
}

export interface ExecutiveReportData {
  kpiSummary: KpiSummary;
  charts: {
    attendanceBreakdown: { _id: string; count: number }[];
    leavesByStatus: { _id: string; count: number }[];
    leavesByType: { _id: string; count: number }[];
    payrollByStatus: { _id: string; totalGross: number; totalNet: number; count: number }[];
    assetsByStatus: { _id: string; count: number; totalCost: number }[];
    assetsByCategory: { _id: string; count: number; totalCost: number }[];
    ticketsByPriority: { _id: string; count: number }[];
    ticketsByStatus: { _id: string; count: number }[];
    performanceRatingCurve: { _id: string; count: number }[];
  };
  departments: DepartmentSummary[];
}
