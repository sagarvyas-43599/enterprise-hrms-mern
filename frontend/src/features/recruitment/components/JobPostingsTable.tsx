"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  MapPin,
  Building2,
  Users,
  Trash2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useDeleteJobPostingMutation } from "@/redux/services/recruitmentApi";
import { JobPosting } from "../types/recruitment.types";
import { Pagination } from "@/components/ui/Pagination";

interface JobPostingsTableProps {
  jobs: JobPosting[];
  isLoading: boolean;
  onAddCandidateForJob?: (jobId: string) => void;
  isHrOrAdmin: boolean;
}

export const JobPostingsTable: React.FC<JobPostingsTableProps> = ({
  jobs = [],
  isLoading = false,
  onAddCandidateForJob,
  isHrOrAdmin,
}) => {
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobPostingMutation();
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await deleteJob(jobToDelete._id).unwrap();
      toast.success("Job opening archived successfully!");
      setJobToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete job opening.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No Job Openings Created Yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Start by posting your company's open engineering, design, or business roles.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Job Role & Code</th>
                <th className="py-3.5 px-4">Department & Location</th>
                <th className="py-3.5 px-4">Experience & Salary</th>
                <th className="py-3.5 px-4">Headcount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {currentJobs.map((job) => {
                const deptName =
                  typeof job.departmentId === "object" && job.departmentId
                    ? job.departmentId.name
                    : "Corporate Department";

                return (
                  <tr
                    key={job._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Role Title & Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {job.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">{job.jobCode}</span>
                            <span>•</span>
                            <span>{job.employmentType.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Location */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {deptName}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                    </td>

                    {/* Experience & Salary */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {job.experienceMinYears}+ Yrs Experience
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}
                      </div>
                    </td>

                    {/* Headcount */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {job.openPositions}
                      </span>{" "}
                      <span className="text-slate-400 text-[11px]">positions</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {job.status === "OPEN" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Actively Hiring
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          {job.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onAddCandidateForJob && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAddCandidateForJob(job._id)}
                            className="h-8 text-xs px-2.5"
                          >
                            Add Applicant
                          </Button>
                        )}

                        {isHrOrAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setJobToDelete(job)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {jobs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={jobs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Delete / Archive Confirmation Modal */}
      {jobToDelete && (
        <ConfirmModal
          isOpen={!!jobToDelete}
          onClose={() => setJobToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Archive Job Opening"
          description="Are you sure you want to archive this job opening? Candidates associated with this posting will remain in the applicant history."
          itemName={jobToDelete.title}
          itemSubtext={jobToDelete.jobCode}
          warningNotice="Archiving will close this job role from active candidate application submission."
          confirmText="Archive Opening"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  );
};
