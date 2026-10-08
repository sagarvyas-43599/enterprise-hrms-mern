"use client";

import React from "react";
import {
  Users,
  Star,
  ChevronRight,
  Mail,
  Phone,
  Building,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Candidate, CandidateStage, STAGE_CONFIG } from "../types/recruitment.types";

interface CandidateKanbanBoardProps {
  candidates: Candidate[];
  isLoading: boolean;
  onUpdateStage: (candidate: Candidate) => void;
}

export const CandidateKanbanBoard: React.FC<CandidateKanbanBoardProps> = ({
  candidates = [],
  isLoading = false,
  onUpdateStage,
}) => {
  const pipelineStages: CandidateStage[] = [
    "APPLIED",
    "SCREENING",
    "INTERVIEW_SCHEDULED",
    "TECHNICAL_EVALUATION",
    "OFFER_EXTENDED",
    "HIRED",
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pipelineStages.map((stage) => (
          <div
            key={stage}
            className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 h-96 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
      {pipelineStages.map((stageKey) => {
        const stageInfo = STAGE_CONFIG[stageKey];
        const stageCandidates = candidates.filter((c) => c.stage === stageKey);

        return (
          <div
            key={stageKey}
            className={`bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-t-4 ${stageInfo.columnClass} rounded-2xl p-3.5 space-y-3 min-h-[380px] flex flex-col`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {stageInfo.label}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {stageCandidates.length}
              </span>
            </div>

            {/* Candidate Cards */}
            <div className="space-y-2.5 flex-1">
              {stageCandidates.length === 0 ? (
                <div className="text-[11px] text-slate-400 text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No applicants
                </div>
              ) : (
                stageCandidates.map((candidate) => {
                  const jobTitle =
                    typeof candidate.jobId === "object" && candidate.jobId
                      ? candidate.jobId.title
                      : "Open Position";

                  return (
                    <div
                      key={candidate._id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3 shadow-sm hover:shadow transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {candidate.fullName}
                          </h5>
                          <p className="text-[10px] font-mono text-slate-400">
                            {candidate.candidateCode}
                          </p>
                        </div>
                        <div className="flex text-amber-400 text-[10px]">
                          {[...Array(candidate.rating || 3)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                      </div>

                      {/* Job Role applied for */}
                      <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 line-clamp-1">
                        {jobTitle}
                      </div>

                      {/* Details */}
                      <div className="space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {candidate.currentCompany && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{candidate.currentCompany}</span>
                          </div>
                        )}
                        {candidate.expectedSalary ? (
                          <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <DollarSign className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            <span>Exp: ₹{candidate.expectedSalary.toLocaleString()}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Interviewer Notes if present */}
                      {candidate.interviewerNotes && (
                        <p className="text-[10px] text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          &quot;{candidate.interviewerNotes}&quot;
                        </p>
                      )}

                      {/* Advance Stage Action */}
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        {candidate.portfolioUrl ? (
                          <a
                            href={candidate.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-500 hover:underline inline-flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Resume
                          </a>
                        ) : (
                          <span />
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUpdateStage(candidate)}
                          className="h-6 px-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold"
                          rightIcon={<ChevronRight className="w-3 h-3" />}
                        >
                          Stage
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
