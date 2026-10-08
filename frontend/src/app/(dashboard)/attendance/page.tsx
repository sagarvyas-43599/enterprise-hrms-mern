"use client";

import React, { useState } from "react";
import {
  Clock,
  Plus,
  RefreshCw,
  Filter,
  AlertCircle,
  FileSpreadsheet,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AttendanceStatsCards } from "@/features/attendance/components/AttendanceStatsCards";
import { AttendanceTable } from "@/features/attendance/components/AttendanceTable";
import { RegularizeAttendanceModal } from "@/features/attendance/components/RegularizeAttendanceModal";
import { useGetAttendanceHistoryQuery } from "@/redux/services/attendanceApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/uiSlice";
import { AttendanceStatus } from "@/features/attendance/types/attendance.types";

export default function AttendancePage() {
  const dispatch = useAppDispatch();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRecordForRegularize, setSelectedRecordForRegularize] = useState<any>(null);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedStatus, searchDate]);
  
  const { user } = useAppSelector((state) => state.auth);
  const isHrOrAdmin = user?.role === "HR_ADMIN" || user?.role === "SUPER_ADMIN";

  // RTK Query Hook
  const { data, isLoading, isError, refetch, isFetching } =
    useGetAttendanceHistoryQuery({
      search: debouncedSearch || undefined,
      status:
        selectedStatus !== "ALL"
          ? (selectedStatus as AttendanceStatus)
          : undefined,
      startDate: searchDate || undefined,
      endDate: searchDate || undefined,
      page,
      limit,
    });

  const records = data?.data?.records || [];
  const meta = data?.data?.meta;
  const total = meta?.total || 0;

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ["Employee ID", "Name", "Date", "Clock In", "Clock Out", "Duration (Mins)", "Overtime (Mins)", "Shortfall (Mins)", "Status"];
    
    const rows = records.map(record => {
      const emp = typeof record.employeeId === 'object' ? record.employeeId : null;
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
      const empId = emp ? emp.employeeId : record.employeeId;
      
      return [
        empId,
        empName,
        record.date,
        record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '--',
        record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '--',
        record.workDurationMinutes,
        record.overtimeMinutes,
        record.shortfallMinutes,
        record.status
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${searchDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Workforce Attendance & Time
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time punch logging, geofenced shifts, work durations, and
                monthly compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              dispatch(openModal({ modalType: "CHECK_IN_ATTENDANCE" }))
            }
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Punch Clock-In
          </Button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <AttendanceStatsCards stats={meta?.stats} totalRecords={total} />

      {/* Error Alert Display */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold">
                Unable to load attendance records
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Ensure backend API is running on port 5000 and auth token is
                valid.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-rose-300 text-rose-700 hover:bg-rose-100"
            onClick={() => refetch()}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Filter and Control Toolbar */}
      {/* Filter and Control Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar for HRs/Admins */}
        {isHrOrAdmin ? (
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search attendance by Employee Name..."
              className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        ) : (
          <div></div> /* Empty div to push filters right */
        )}


        {/* Filters & Export */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
          >
            <option value="ALL">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="WORK_FROM_HOME">Work from Home</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent</option>
          </select>

          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {searchDate && (
            <button
              onClick={() => setSearchDate("")}
              className="text-xs text-rose-500 hover:underline"
            >
              Clear
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={records.length === 0}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Export CSV
          </Button>
        </div>
      </div>
      </div>

      {/* Attendance Data Table */}
      <AttendanceTable 
        records={records} 
        isLoading={isLoading} 
        currentPage={page}
        totalItems={total}
        itemsPerPage={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        canManage={isHrOrAdmin}
        onRegularizeClick={(record) => setSelectedRecordForRegularize(record)}
      />

      <RegularizeAttendanceModal 
        isOpen={!!selectedRecordForRegularize}
        onClose={() => setSelectedRecordForRegularize(null)}
        record={selectedRecordForRegularize}
      />
    </div>
  );
}
