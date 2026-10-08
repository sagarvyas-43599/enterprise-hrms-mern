"use client";

import React from "react";
import {
  LifeBuoy,
  MessageSquare,
  ArrowRightCircle,
  Clock,
  User,
  Shield,
  Laptop,
  CreditCard,
  Building,
  HelpCircle,
  AlertCircle,
  CalendarClock
} from "lucide-react";
import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../types/ticket.types";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { formatDate } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { Pagination } from "@/components/ui/Pagination";

interface TicketTableProps {
  tickets?: Ticket[];
  isLoading: boolean;
  onViewThread?: (ticket: Ticket) => void;
  onUpdateStatus?: (ticket: Ticket) => void;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets = [],
  isLoading,
  onViewThread,
  onUpdateStatus,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const canManage =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  const getCategoryBadge = (category: TicketCategory) => {
    switch (category) {
      case "IT_SUPPORT":
        return <Badge variant="info">IT SUPPORT</Badge>;
      case "PAYROLL_QUERY":
        return <Badge variant="success">PAYROLL QUERY</Badge>;
      case "HR_POLICY":
        return <Badge variant="purple">HR POLICY</Badge>;
      case "FACILITIES_ADMIN":
        return <Badge variant="warning">FACILITIES</Badge>;
      case "GENERAL":
      default:
        return <Badge variant="neutral">GENERAL</Badge>;
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            URGENT
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
            MEDIUM
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "RESOLVED":
        return <Badge variant="success">RESOLVED</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">IN PROGRESS</Badge>;
      case "CLOSED":
        return <Badge variant="neutral">CLOSED</Badge>;
      case "OPEN":
      default:
        return <Badge variant="warning">OPEN</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
          <LifeBuoy className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Helpdesk Tickets Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No support queries matching the current filter. Click Raise New Ticket
          to submit an issue to IT or HR support.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
              <th className="py-3.5 px-4">Ticket ID & Subject</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Requester Staff</th>
              <th className="py-3.5 px-4">Assigned Agent</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {tickets.map((ticket) => {
              const requester =
                typeof ticket.employeeId === "object" && ticket.employeeId
                  ? ticket.employeeId
                  : typeof ticket.raisedBy === "object" && ticket.raisedBy
                  ? ticket.raisedBy
                  : null;

              const requesterName = requester
                ? `${requester.firstName} ${requester.lastName}`
                : "Staff Member";
              const requesterEmpId = requester?.empId || "EMP";

              const assignee =
                typeof ticket.assignedTo === "object" && ticket.assignedTo
                  ? ticket.assignedTo
                  : null;

              const conversationCount =
                ticket.conversations?.length || ticket.messages?.length || 0;

              return (
                <tr
                  key={ticket._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Ticket ID & Subject */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                          {ticket.ticketId}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {ticket.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    {getCategoryBadge(ticket.category)}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    {getPriorityBadge(ticket.priority)}
                  </td>

                  {/* Requester Staff */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px] uppercase">
                        {requesterName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {requesterName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {requesterEmpId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Agent */}
                  <td className="py-3.5 px-4">
                    {assignee ? (
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>
                          {assignee.firstName} {assignee.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <div>{getStatusBadge(ticket.status)}</div>
                      {ticket.dueDate && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                        <div className={`flex items-center gap-1 text-[10px] font-medium ${new Date(ticket.dueDate) < new Date() ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                          {new Date(ticket.dueDate) < new Date() ? <AlertCircle className="w-3 h-3" /> : <CalendarClock className="w-3 h-3" />}
                          SLA: {new Date(ticket.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Conversation Thread */}
                      <button
                        type="button"
                        onClick={() => onViewThread?.(ticket)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="View conversation and reply"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Thread ({conversationCount})</span>
                      </button>

                      {/* Manage Status & Assignment (HR/Admin) */}
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus?.(ticket)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Update status & assignment"
                        >
                          <ArrowRightCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange || (() => {})}
          />
        </div>
      )}
    </div>
  );
};
