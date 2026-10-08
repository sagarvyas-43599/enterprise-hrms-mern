import { EmployeeModel } from '../models/employee.model';
import { DepartmentModel } from '../models/department.model';
import { AttendanceModel } from '../models/attendance.model';
import { LeaveModel } from '../models/leave.model';
import { PayrollModel } from '../models/payroll.model';
import { AssetModel } from '../models/asset.model';
import { TicketModel } from '../models/ticket.model';
import { AppraisalModel } from '../models/performance.model';
import { PolicyModel, PolicyAcknowledgmentModel } from '../models/policy.model';

export class ReportService {
  async getExecutiveSummary(query: { startDate?: string; endDate?: string; departmentCode?: string } = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseFilter: any = { isDeleted: false };
    const dateFilter: any = {};
    const attendanceDateFilter: any = {};
    
    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      
      dateFilter.createdAt = { $gte: start, $lte: end };
      attendanceDateFilter.date = { $gte: start, $lte: end };
    } else {
      // Default attendance to today if no range is specified
      attendanceDateFilter.date = { $gte: today };
    }

    const employeeMatch: any = {};
    if (query.departmentCode && query.departmentCode !== "ALL") {
      const empsInDept = await EmployeeModel.find({ department: query.departmentCode, isDeleted: false }, { _id: 1 }).lean();
      const empIds = empsInDept.map(e => e._id);
      employeeMatch.employeeId = { $in: empIds };
    }

    const filterWithDate = { ...baseFilter, ...dateFilter, ...employeeMatch };
    const attendanceMatchFilter = { ...attendanceDateFilter, ...employeeMatch };

    const [
      totalEmployees,
      departments,
      attendancesToday,
      leavesSummary,
      payrollSummary,
      assetsSummary,
      ticketsSummary,
      appraisalsSummary,
      policiesCount,
      acknowledgmentsCount,
    ] = await Promise.all([
      // 1. Active Employees (usually current snapshot, but we can filter by date if needed. Keeping as baseFilter for active employees)
      EmployeeModel.countDocuments(query.departmentCode && query.departmentCode !== "ALL" ? { department: query.departmentCode, ...baseFilter, ...dateFilter } : filterWithDate),

      // 2. Departments with budget
      DepartmentModel.find(baseFilter).lean(),

      // 3. Attendance
      AttendanceModel.aggregate([
        { $match: attendanceMatchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // 4. Leaves Breakdown
      LeaveModel.aggregate([
        { $match: filterWithDate },
        {
          $facet: {
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            byType: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
          },
        },
      ]),

      // 5. Payroll Expenditures
      PayrollModel.aggregate([
        { $match: filterWithDate },
        {
          $group: {
            _id: '$status',
            totalGross: { $sum: '$grossSalary' },
            totalNet: { $sum: '$netSalary' },
            totalDeductions: { $sum: '$totalDeductions' },
            count: { $sum: 1 },
          },
        },
      ]),

      // 6. Hardware Asset Capital Valuation
      AssetModel.aggregate([
        { $match: filterWithDate },
        {
          $facet: {
            byStatus: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                  totalCost: { $sum: '$purchaseCost' },
                },
              },
            ],
            byCategory: [
              {
                $group: {
                  _id: '$category',
                  count: { $sum: 1 },
                  totalCost: { $sum: '$purchaseCost' },
                },
              },
            ],
            overall: [
              {
                $group: {
                  _id: null,
                  totalValuation: { $sum: '$purchaseCost' },
                  totalAssets: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),

      // 7. Helpdesk Tickets SLA
      TicketModel.aggregate([
        { $match: filterWithDate },
        {
          $facet: {
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          },
        },
      ]),

      // 8. Performance Appraisals Rating Breakdown
      AppraisalModel.aggregate([
        { $match: { ...filterWithDate, finalRating: { $ne: null } } },
        {
          $group: {
            _id: '$finalRating',
            count: { $sum: 1 },
          },
        },
      ]),

      // 9. Policies & Compliance
      PolicyModel.countDocuments({ ...baseFilter, ...dateFilter, status: 'PUBLISHED' }),
      PolicyAcknowledgmentModel.countDocuments({ ...dateFilter, ...employeeMatch }),
    ]);

    // Parse Asset Overall
    const totalAssetValuation = assetsSummary[0]?.overall[0]?.totalValuation || 0;
    const totalAssetsCount = assetsSummary[0]?.overall[0]?.totalAssets || 0;

    // Parse Payroll Totals
    let totalGrossSpend = 0;
    let totalNetSpend = 0;
    payrollSummary.forEach((p: { totalGross?: number; totalNet?: number }) => {
      totalGrossSpend += p.totalGross || 0;
      totalNetSpend += p.totalNet || 0;
    });

    // Attendance Rate Today
    const presentCount =
      attendancesToday.find((a: { _id: string; count: number }) => a._id === 'PRESENT' || a._id === 'WORK_FROM_HOME')?.count || 0;
    const attendanceRate =
      totalEmployees > 0 ? Math.min(100, Math.round((presentCount / totalEmployees) * 100)) : 100;

    // Leaves Approved vs Total
    const approvedLeaves =
      leavesSummary[0]?.byStatus?.find((s: any) => s._id === 'APPROVED')?.count || 0;
    const pendingLeaves =
      leavesSummary[0]?.byStatus?.find((s: any) => s._id === 'PENDING')?.count || 0;

    // Tickets Solved vs Total
    const resolvedTickets =
      ticketsSummary[0]?.byStatus?.find((s: any) => s._id === 'RESOLVED' || s._id === 'CLOSED')?.count || 0;
    const openTickets =
      ticketsSummary[0]?.byStatus?.find((s: any) => s._id === 'OPEN' || s._id === 'IN_PROGRESS')?.count || 0;

    // 6-Month Trend Analytics (Tickets vs Expenses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [payrollTrend, ticketTrend] = await Promise.all([
      PayrollModel.aggregate([
        { $match: { ...baseFilter, ...employeeMatch, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            expenses: { $sum: '$netSalary' },
          },
        },
      ]),
      TicketModel.aggregate([
        { $match: { ...baseFilter, ...employeeMatch, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            tickets: { $sum: 1 },
          },
        },
      ]),
    ]);

    const trendData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const pt = payrollTrend.find((x) => x._id.month === m && x._id.year === y);
      const tt = ticketTrend.find((x) => x._id.month === m && x._id.year === y);

      trendData.push({
        month: monthNames[d.getMonth()],
        expenses: pt ? pt.expenses : 0,
        tickets: tt ? tt.tickets : 0,
      });
    }

    return {
      kpiSummary: {
        totalHeadcount: totalEmployees,
        attendanceRatePercent: attendanceRate,
        monthlyGrossPayroll: totalGrossSpend,
        monthlyNetPayroll: totalNetSpend,
        totalAssetValuation,
        totalAssetsCount,
        openTicketsCount: openTickets,
        resolvedTicketsCount: resolvedTickets,
        approvedLeavesCount: approvedLeaves,
        pendingLeavesCount: pendingLeaves,
        publishedPolicies: policiesCount,
        totalAcknowledgments: acknowledgmentsCount,
      },
      charts: {
        attendanceBreakdown: attendancesToday,
        leavesByStatus: leavesSummary[0]?.byStatus || [],
        leavesByType: leavesSummary[0]?.byType || [],
        payrollByStatus: payrollSummary,
        assetsByStatus: assetsSummary[0]?.byStatus || [],
        assetsByCategory: assetsSummary[0]?.byCategory || [],
        ticketsByPriority: ticketsSummary[0]?.byPriority || [],
        ticketsByStatus: ticketsSummary[0]?.byStatus || [],
        performanceRatingCurve: appraisalsSummary,
        trendData,
      },
      departments: departments.map((d: any) => ({
        id: d._id,
        code: d.code,
        name: d.name,
        annualBudget: d.annualBudget,
      })),
    };
  }
}
