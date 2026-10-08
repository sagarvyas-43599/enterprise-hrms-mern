"use client";

import React from "react";
import {
  Award,
  Star,
  UserCheck,
  TrendingUp,
  Building,
  CheckCircle,
  FileText,
  Printer,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Appraisal, PerformanceRating } from "../types/performance.types";

interface AppraisalDetailModalProps {
  appraisal: Appraisal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppraisalDetailModal: React.FC<AppraisalDetailModalProps> = ({
  appraisal,
  isOpen,
  onClose,
}) => {
  if (!appraisal) return null;

  const emp =
    typeof appraisal.employeeId === "object" && appraisal.employeeId
      ? appraisal.employeeId
      : null;
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : "Staff Member";
  const empId = emp?.empId || "EMP";

  const getRatingBadge = (rating?: PerformanceRating | null) => {
    if (!rating) return <Badge variant="neutral">PENDING CALIBRATION</Badge>;
    switch (rating) {
      case "OUTSTANDING":
        return <Badge variant="purple">OUTSTANDING</Badge>;
      case "EXCEEDS_EXPECTATIONS":
        return <Badge variant="info">EXCEEDS EXPECTATIONS</Badge>;
      case "MEETS_EXPECTATIONS":
        return <Badge variant="success">MEETS EXPECTATIONS</Badge>;
      case "NEEDS_IMPROVEMENT":
        return <Badge variant="warning">NEEDS IMPROVEMENT</Badge>;
      case "UNSATISFACTORY":
        return <Badge variant="danger">UNSATISFACTORY</Badge>;
      default:
        return <Badge variant="neutral">{rating}</Badge>;
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printable-scorecard")?.innerHTML;
    if (!printContents) return;
    
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      const styleTags = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
        .map((el) => el.outerHTML)
        .join("\n");
        
      iframeDoc.write(`
        <html>
          <head>
            <title>Scorecard_${empName}</title>
            ${styleTags}
            <style>
              @media print {
                body { background: white; margin: 0; padding: 20px; }
                .print-hide { display: none !important; }
              }
            </style>
          </head>
          <body class="bg-white">
            <div class="max-w-3xl mx-auto">
              ${printContents}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();
      
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="360 Performance Review Scorecard"
      description={`Official appraisal scorecard for ${empName} (${empId})`}
      maxWidth="lg"
    >
      <div id="printable-scorecard" className="space-y-4 print:p-0">
        {/* Header Hero */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-purple-300">
                {appraisal.cycleName} • Year {appraisal.year}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {empName}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {emp?.department || "Department"} • {emp?.designation || "Staff"}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-purple-300 uppercase block font-semibold">
                Calibrated Rating
              </span>
              <div className="mt-1">{getRatingBadge(appraisal.finalRating)}</div>
            </div>
          </div>
        </div>

        {/* Self Assessment Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-500" />
              Employee Self Assessment
            </span>
            {appraisal.selfRating ? (
              <div className="flex items-center gap-1 font-bold text-xs text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{appraisal.selfRating} / 5 Stars (Overall)</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Not Submitted</span>
            )}
          </div>
          {appraisal.selfComments ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {appraisal.selfComments}
              </p>
              {appraisal.selfCompetencies && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {Object.entries(appraisal.selfCompetencies).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-1 text-[10px]">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400 font-semibold capitalize">
                        <span>{key}</span>
                        <span>{val}/5</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${(Number(val) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Self review has not been completed by the employee yet.
            </p>
          )}
        </div>

        {/* Manager Evaluation Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-500" />
              Manager Evaluation & Remarks
            </span>
            {appraisal.managerRating ? (
              <div className="flex items-center gap-1 font-bold text-xs text-blue-500">
                <Star className="w-3.5 h-3.5 fill-blue-400" />
                <span>{appraisal.managerRating} / 5 Stars (Overall)</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Pending Evaluation</span>
            )}
          </div>
          {appraisal.managerComments ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {appraisal.managerComments}
              </p>
              {appraisal.managerCompetencies && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {Object.entries(appraisal.managerCompetencies).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-1 text-[10px]">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400 font-semibold capitalize">
                        <span>{key}</span>
                        <span>{val}/5</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${(Number(val) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Manager has not evaluated this review cycle yet.
            </p>
          )}
        </div>

        {/* Promotion & Compensation Outcome */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">
              Promotion Recommendation:
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {appraisal.promotionRecommended ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Recommended for Promotion
                </span>
              ) : (
                "Standard Progression"
              )}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">
              Recommended Salary Increment:
            </span>
            <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
              +{appraisal.salaryHikeRecommendedPercent || 0}% Annual Hike
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Scorecard
          </Button>
          <Button type="button" variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
