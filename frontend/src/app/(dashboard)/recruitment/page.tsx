"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Users,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Kanban,
  TableProperties,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RecruitmentStatsCards } from "@/features/recruitment/components/RecruitmentStatsCards";
import { JobPostingsTable } from "@/features/recruitment/components/JobPostingsTable";
import { CandidateKanbanBoard } from "@/features/recruitment/components/CandidateKanbanBoard";
import { CreateJobModal } from "@/features/recruitment/components/CreateJobModal";
import { AddCandidateModal } from "@/features/recruitment/components/AddCandidateModal";
import { UpdateCandidateStageModal } from "@/features/recruitment/components/UpdateCandidateStageModal";
import {
  useGetRecruitmentMetricsQuery,
  useGetJobPostingsQuery,
  useGetCandidatesQuery,
} from "@/redux/services/recruitmentApi";
import { useAppSelector } from "@/redux/hooks";
import { Candidate } from "@/features/recruitment/types/recruitment.types";

export default function RecruitmentPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [activeView, setActiveView] = useState<"KANBAN" | "JOBS">("KANBAN");
  const [selectedJobId, setSelectedJobId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Modals state
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [jobIdForNewCandidate, setJobIdForNewCandidate] = useState<string | undefined>();
  const [candidateForStage, setCandidateForStage] = useState<Candidate | null>(null);

  const isHrOrAdmin =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  // RTK Queries
  const { data: metricsData, isLoading: isMetricsLoading } =
    useGetRecruitmentMetricsQuery();

  const {
    data: jobsDataResponse,
    isLoading: isJobsLoading,
    refetch: refetchJobs,
    isFetching: isJobsFetching,
  } = useGetJobPostingsQuery({
    search: activeView === "JOBS" ? (debouncedSearch.trim() || undefined) : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const {
    data: candidatesDataResponse,
    isLoading: isCandidatesLoading,
    refetch: refetchCandidates,
    isFetching: isCandidatesFetching,
  } = useGetCandidatesQuery({
    jobId: selectedJobId !== "ALL" ? selectedJobId : undefined,
    search: activeView === "KANBAN" ? (debouncedSearch.trim() || undefined) : undefined,
    limit: 100,
  });

  const jobs = jobsDataResponse?.data?.jobs || [];
  const candidates = candidatesDataResponse?.data?.candidates || [];

  const handleRefresh = () => {
    refetchJobs();
    refetchCandidates();
  };

  // Server-side filtering applied via RTK Query
  const filteredCandidates = candidates;
  const filteredJobs = jobs;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recruitment & Applicant Tracking (ATS)
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              Talent Acquisition
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage corporate openings, candidate evaluation pipeline stages, and hiring decisions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isJobsFetching || isCandidatesFetching}
            className="h-9 px-3"
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isJobsFetching || isCandidatesFetching ? "animate-spin" : ""
                }`}
              />
            }
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddCandidateOpen(true)}
            className="h-9 px-3.5"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Applicant
          </Button>

          {isHrOrAdmin && (
            <Button
              size="sm"
              onClick={() => setIsCreateJobOpen(true)}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20"
              leftIcon={<Briefcase className="w-4 h-4" />}
            >
              Post New Job
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <RecruitmentStatsCards
        metrics={metricsData?.data}
        isLoading={isMetricsLoading}
      />

      {/* Filter and View Switcher Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveView("KANBAN")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeView === "KANBAN"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Candidate Pipeline</span>
            </button>
            <button
              onClick={() => setActiveView("JOBS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeView === "JOBS"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Job Openings ({jobs.length})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Job Openings Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="ALL">All Job Openings</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.jobCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === "KANBAN" ? (
        <CandidateKanbanBoard
          candidates={filteredCandidates}
          isLoading={isCandidatesLoading}
          onUpdateStage={(candidate) => setCandidateForStage(candidate)}
        />
      ) : (
        <JobPostingsTable
          jobs={filteredJobs}
          isLoading={isJobsLoading}
          onAddCandidateForJob={(jobId) => {
            setJobIdForNewCandidate(jobId);
            setIsAddCandidateOpen(true);
          }}
          isHrOrAdmin={isHrOrAdmin}
        />
      )}

      {/* Modal: Post New Job */}
      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
      />

      {/* Modal: Add Candidate */}
      <AddCandidateModal
        isOpen={isAddCandidateOpen}
        onClose={() => {
          setIsAddCandidateOpen(false);
          setJobIdForNewCandidate(undefined);
        }}
        defaultJobId={jobIdForNewCandidate}
      />

      {/* Modal: Advance Stage */}
      <UpdateCandidateStageModal
        isOpen={!!candidateForStage}
        onClose={() => setCandidateForStage(null)}
        candidate={candidateForStage}
      />
    </div>
  );
}
