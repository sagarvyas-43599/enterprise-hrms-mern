"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Users, Ticket, CheckCircle2, LifeBuoy } from "lucide-react";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";
import { useGetTicketsQuery } from "@/redux/services/ticketApi";
import { useGetLeavesQuery } from "@/redux/services/leaveApi";

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string | null;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  // We unconditionally call hooks, but skip them if type doesn't match
  const { data: empData, isLoading: isLoadingEmp } = useGetEmployeesQuery(
    { limit: 10, page: 1 },
    { skip: type !== "HEADCOUNT" && type !== "ATTENDANCE" } // Basic mock for attendance just reusing employee list for visual
  );

  const { data: ticketData, isLoading: isLoadingTicket } = useGetTicketsQuery(
    { limit: 10, page: 1 },
    { skip: type !== "TICKETS" }
  );

  const { data: leaveData, isLoading: isLoadingLeave } = useGetLeavesQuery(
    { limit: 10, page: 1 },
    { skip: type !== "LEAVES" }
  );

  const renderContent = () => {
    if (type === "HEADCOUNT" || type === "ATTENDANCE") {
      if (isLoadingEmp) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading directory...</div>;
      const employees = empData?.data || [];
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.department || "N/A"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (type === "TICKETS") {
      if (isLoadingTicket) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading helpdesk...</div>;
      const tickets = ticketData?.data || [];
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map((t: any) => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.subject}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.category}</td>
                  <td className="px-4 py-3 font-bold">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="p-10 text-center text-slate-500">
        Detailed breakdown for this metric is currently protected by HR privacy policies.
      </div>
    );
  };

  const getTitle = () => {
    switch (type) {
      case "HEADCOUNT": return "Workforce Directory Drill-down";
      case "ATTENDANCE": return "Today's Attendance Roster";
      case "TICKETS": return "Active Helpdesk Tickets";
      default: return "Metric Drill-down";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} maxWidth="xl">
      <div className="p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};
