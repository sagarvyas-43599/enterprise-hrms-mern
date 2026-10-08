"use client";

import React, { useState } from "react";
import {
  Target,
  Award,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { PerformanceStatsCards } from "@/features/performance/components/PerformanceStatsCards";
import { GoalTable } from "@/features/performance/components/GoalTable";
import { AppraisalTable } from "@/features/performance/components/AppraisalTable";
import { CreateGoalModal } from "@/features/performance/components/CreateGoalModal";
import { UpdateGoalProgressModal } from "@/features/performance/components/UpdateGoalProgressModal";
import { InitiateAppraisalModal } from "@/features/performance/components/InitiateAppraisalModal";
import { SelfReviewModal } from "@/features/performance/components/SelfReviewModal";
import { ManagerReviewModal } from "@/features/performance/components/ManagerReviewModal";
import { AppraisalDetailModal } from "@/features/performance/components/AppraisalDetailModal";
import {
  useGetGoalsQuery,
  useGetAppraisalsQuery,
} from "@/redux/services/performanceApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/uiSlice";
import {
  Goal,
  Appraisal,
  GoalStatus,
} from "@/features/performance/types/performance.types";

export default function PerformancePage() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<"GOALS" | "APPRAISALS">("GOALS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const [selectedGoalStatus, setSelectedGoalStatus] = useState<string>("ALL");
  const [selectedAppraisalStatus, setSelectedAppraisalStatus] = useState<string>("ALL");

  React.useEffect(() => {
    setGoalPage(1);
    setAppraisalPage(1);
  }, [debouncedSearch, selectedGoalStatus, selectedAppraisalStatus]);
  
  // Pagination
  const [goalPage, setGoalPage] = useState(1);
  const [goalLimit, setGoalLimit] = useState(10);
  const [appraisalPage, setAppraisalPage] = useState(1);
  const [appraisalLimit, setAppraisalLimit] = useState(10);

  // Selected items for modals
  const [selectedGoalForProgress, setSelectedGoalForProgress] =
    useState<Goal | null>(null);
  const [selectedAppraisalForSelfReview, setSelectedAppraisalForSelfReview] =
    useState<Appraisal | null>(null);
  const [
    selectedAppraisalForManagerReview,
    setSelectedAppraisalForManagerReview,
  ] = useState<Appraisal | null>(null);
  const [selectedAppraisalForDetail, setSelectedAppraisalForDetail] =
    useState<Appraisal | null>(null);

  const canManageCycles =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  // Fetch Goals
  const {
    data: goalsData,
    isLoading: isGoalsLoading,
    isFetching: isGoalsFetching,
    refetch: refetchGoals,
  } = useGetGoalsQuery({
    search: debouncedSearch || undefined,
    status:
      selectedGoalStatus !== "ALL"
        ? (selectedGoalStatus as GoalStatus)
        : undefined,
    page: goalPage,
    limit: goalLimit,
  });

  // Fetch Appraisals
  const {
    data: appraisalsData,
    isLoading: isAppraisalsLoading,
    isFetching: isAppraisalsFetching,
    refetch: refetchAppraisals,
  } = useGetAppraisalsQuery({
    search: debouncedSearch || undefined,
    status:
      selectedAppraisalStatus !== "ALL"
        ? (selectedAppraisalStatus as any)
        : undefined,
    page: appraisalPage,
    limit: appraisalLimit,
  });

  const goals: Goal[] = goalsData?.data || [];
  const appraisals: Appraisal[] = appraisalsData?.data || [];

  const handleRefresh = () => {
    if (activeTab === "GOALS") refetchGoals();
    else refetchAppraisals();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            <Target className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Performance, OKRs & Appraisals
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track objective milestones, employee self-evaluations, manager reviews,
              and merit calibrations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isGoalsFetching || isAppraisalsFetching}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isGoalsFetching || isAppraisalsFetching ? "animate-spin" : ""
                }`}
              />
            }
          >
            Refresh
          </Button>

          {/* Create Goal Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(openModal({ modalType: "CREATE_GOAL" }))}
            leftIcon={<Target className="w-3.5 h-3.5" />}
          >
            Create Goal / OKR
          </Button>

          {/* Initiate Appraisal Cycle Action (HR/Admin) */}
          {canManageCycles && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                dispatch(openModal({ modalType: "INITIATE_APPRAISAL" }))
              }
              leftIcon={<Award className="w-3.5 h-3.5" />}
            >
              Initiate Cycle
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Overview */}
      <PerformanceStatsCards
        goals={goals}
        appraisals={appraisals}
        isLoading={isGoalsLoading || isAppraisalsLoading}
      />

      {/* Modern Pill Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("GOALS")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "GOALS"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Objectives & OKRs</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "GOALS"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {goalsData?.meta?.total || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("APPRAISALS")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "APPRAISALS"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Appraisal Review Cycles</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "APPRAISALS"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {appraisalsData?.meta?.total || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "GOALS"
                ? "Search goals, objectives, or employee..."
                : "Search appraisal cycle or employee..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Filter for Goals */}
        {activeTab === "GOALS" ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedGoalStatus}
              onChange={(e) => setSelectedGoalStatus(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="ALL">All Status</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="NOT_STARTED">NOT STARTED</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="IN_PROGRESS">IN PROGRESS</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="COMPLETED">COMPLETED</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="CANCELLED">CANCELLED</option>
            </select>

            {(selectedGoalStatus !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedGoalStatus("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={selectedAppraisalStatus}
              onChange={(e) => setSelectedAppraisalStatus(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="ALL">All Status</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="DRAFT">DRAFT</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="SELF_REVIEW_SUBMITTED">SELF REVIEW SUBMITTED</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="MANAGER_REVIEWED">MANAGER REVIEWED</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="COMPLETED">COMPLETED</option>
            </select>

            {(selectedAppraisalStatus !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAppraisalStatus("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="space-y-4">
        {activeTab === "GOALS" ? (
          <GoalTable
            goals={goals}
            isLoading={isGoalsLoading || isGoalsFetching}
            onUpdateProgress={(goal) => setSelectedGoalForProgress(goal)}
            currentPage={goalPage}
            totalItems={goalsData?.meta?.total || 0}
            itemsPerPage={goalLimit}
            onPageChange={(p) => setGoalPage(p)}
            onLimitChange={(l) => {
              setGoalLimit(l);
              setGoalPage(1);
            }}
          />
        ) : (
          <AppraisalTable
            appraisals={appraisals}
            isLoading={isAppraisalsLoading || isAppraisalsFetching}
            onSelfReview={(appraisal) =>
              setSelectedAppraisalForSelfReview(appraisal)
            }
            onManagerReview={(appraisal) =>
              setSelectedAppraisalForManagerReview(appraisal)
            }
            onViewDetails={(appraisal) =>
              setSelectedAppraisalForDetail(appraisal)
            }
            currentPage={appraisalPage}
            totalItems={appraisalsData?.meta?.total || 0}
            itemsPerPage={appraisalLimit}
            onPageChange={(p) => setAppraisalPage(p)}
            onLimitChange={(l) => {
              setAppraisalLimit(l);
              setAppraisalPage(1);
            }}
          />
        )}
      </div>

      {/* Modals Mounting */}
      <CreateGoalModal />

      <UpdateGoalProgressModal
        goal={selectedGoalForProgress}
        isOpen={!!selectedGoalForProgress}
        onClose={() => setSelectedGoalForProgress(null)}
      />

      <InitiateAppraisalModal />

      <SelfReviewModal
        appraisal={selectedAppraisalForSelfReview}
        isOpen={!!selectedAppraisalForSelfReview}
        onClose={() => setSelectedAppraisalForSelfReview(null)}
      />

      <ManagerReviewModal
        appraisal={selectedAppraisalForManagerReview}
        isOpen={!!selectedAppraisalForManagerReview}
        onClose={() => setSelectedAppraisalForManagerReview(null)}
      />

      <AppraisalDetailModal
        appraisal={selectedAppraisalForDetail}
        isOpen={!!selectedAppraisalForDetail}
        onClose={() => setSelectedAppraisalForDetail(null)}
      />
    </div>
  );
}
