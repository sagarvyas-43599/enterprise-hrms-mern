"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  Plus,
  RefreshCw,
  Search,
  Filter,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TicketStatsCards } from "@/features/tickets/components/TicketStatsCards";
import { TicketTable } from "@/features/tickets/components/TicketTable";
import { CreateTicketModal } from "@/features/tickets/components/CreateTicketModal";
import { UpdateTicketStatusModal } from "@/features/tickets/components/UpdateTicketStatusModal";
import { TicketThreadModal } from "@/features/tickets/components/TicketThreadModal";
import {
  useGetTicketsQuery,
  useGetTicketMetricsQuery,
} from "@/redux/services/ticketApi";
import { useAppSelector } from "@/redux/hooks";
import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/features/tickets/types/ticket.types";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "ALL", label: "All Categories" },
  { value: "IT_SUPPORT", label: "IT Hardware & Software" },
  { value: "PAYROLL_QUERY", label: "Payroll & Salary" },
  { value: "HR_POLICY", label: "HR Policies & Benefits" },
  { value: "FACILITIES_ADMIN", label: "Facilities & Office" },
  { value: "GENERAL", label: "General Inquiry" },
];

const PRIORITIES: { value: string; label: string }[] = [
  { value: "ALL", label: "All Priorities" },
  { value: "URGENT", label: "Urgent Priority" },
  { value: "HIGH", label: "High Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "LOW", label: "Low Priority" },
];

const STATUSES: { value: string; label: string }[] = [
  { value: "ALL", label: "All Status" },
  { value: "OPEN", label: "Open (Awaiting Triage)" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export default function TicketsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedPriority, selectedStatus, itemsPerPage]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedTicketForStatus, setSelectedTicketForStatus] =
    useState<Ticket | null>(null);
  const [selectedTicketForThread, setSelectedTicketForThread] =
    useState<Ticket | null>(null);

  // Fetch Tickets
  const {
    data: ticketsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetTicketsQuery({
    search: debouncedSearch || undefined,
    category:
      selectedCategory !== "ALL"
        ? (selectedCategory as TicketCategory)
        : undefined,
    priority:
      selectedPriority !== "ALL"
        ? (selectedPriority as TicketPriority)
        : undefined,
    status:
      selectedStatus !== "ALL" ? (selectedStatus as TicketStatus) : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Fetch Helpdesk Metrics
  const { data: metricsData } = useGetTicketMetricsQuery();

  const tickets: Ticket[] = ticketsData?.data || [];
  const meta = ticketsData?.meta || { total: 0 };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            <LifeBuoy className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Helpdesk & Employee Support Tickets
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit internal queries to IT, HR, and Facilities with live SLA tracking
              and conversation threads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
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
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Raise New Ticket
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <TicketStatsCards
        tickets={tickets}
        metrics={metricsData?.data}
        isLoading={isLoading}
      />

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticket ID, subject, or requester..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {(selectedCategory !== "ALL" ||
            selectedPriority !== "ALL" ||
            selectedStatus !== "ALL" ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedPriority("ALL");
                setSelectedStatus("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Tickets Table */}
      <TicketTable
        tickets={tickets}
        isLoading={isLoading || isFetching}
        onViewThread={(ticket) => setSelectedTicketForThread(ticket)}
        onUpdateStatus={(ticket) => setSelectedTicketForStatus(ticket)}
        currentPage={currentPage}
        totalItems={meta.total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={setItemsPerPage}
      />

      {/* Modal 1: Raise New Support Ticket */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Modal 2: Manage Status & Assign Agent */}
      <UpdateTicketStatusModal
        ticket={tickets.find(t => t._id === selectedTicketForStatus?._id) || selectedTicketForStatus}
        isOpen={!!selectedTicketForStatus}
        onClose={() => setSelectedTicketForStatus(null)}
      />

      {/* Modal 3: View Conversation Thread & Reply */}
      <TicketThreadModal
        ticket={tickets.find(t => t._id === selectedTicketForThread?._id) || selectedTicketForThread}
        isOpen={!!selectedTicketForThread}
        onClose={() => setSelectedTicketForThread(null)}
      />
    </div>
  );
}
