"use client";

import React from "react";
import {
  Printer,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PayrollSlip } from "../types/payroll.types";

interface PayslipModalProps {
  payroll: PayrollSlip | null;
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const PayslipModal: React.FC<PayslipModalProps> = ({
  payroll,
  isOpen,
  onClose,
}) => {
  if (!payroll) return null;

  const emp =
    typeof payroll.employeeId === "object" && payroll.employeeId
      ? payroll.employeeId
      : null;

  const empName = emp ? `${emp.firstName} ${emp.lastName}` : "Staff Member";
  const empId = emp?.empId || "EMP";
  const department = emp?.department || "Corporate Unit";
  const designation = emp?.designation || "Assigned Role";

  const monthName =
    payroll.month >= 1 && payroll.month <= 12
      ? MONTH_NAMES[payroll.month - 1]
      : `Month ${payroll.month}`;

  const grossEarnings =
    (payroll.baseSalary || 0) + (payroll.totalAllowances || 0);

  const handlePrint = () => {
    const printContents = document.getElementById("printable-payslip")?.innerHTML;
    if (!printContents) return;
    
    // Create a temporary iframe for printing
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
      // Copy all style/link tags from parent document
      const styleTags = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
        .map((el) => el.outerHTML)
        .join("\n");
        
      iframeDoc.write(`
        <html>
          <head>
            <title>Payslip_${empName}</title>
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
          document.body.removeChild(iframe);
        }, 500);
      };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Corporate Salary Slip"
      description={`Official itemized statement for pay period ${monthName} ${payroll.year}`}
      maxWidth="lg"
    >
      <div id="printable-payslip" className="space-y-5 print:p-0 bg-white dark:bg-slate-900 rounded-xl">
        {/* Payslip Header Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Building2 className="w-5 h-5" />
                </span>
                <span className="font-bold tracking-tight text-sm uppercase">
                  NEXUS HRMS Enterprise
                </span>
              </div>
              <h3 className="text-lg font-bold mt-1 text-white">
                Itemized Employee Payslip
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/20">
                {monthName} {payroll.year}
              </span>
              <p className="text-[10px] text-slate-300 font-mono mt-1">
                Ref: #{payroll._id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Employee Name
            </span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              {empName}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Employee ID
            </span>
            <p className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {empId}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Department & Title
            </span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">
              {department} • {designation}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Disbursal Status
            </span>
            <div className="mt-0.5">
              {payroll.status === "PAID" ? (
                <Badge variant="success">PAID</Badge>
              ) : payroll.status === "PROCESSED" ? (
                <Badge variant="info">PROCESSED</Badge>
              ) : (
                <Badge variant="warning">DRAFT</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Payment Ref Banner if Paid */}
        {payroll.paymentDate && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>
                Payment Disbursed on{" "}
                <strong>
                  {new Date(payroll.paymentDate).toLocaleDateString()}
                </strong>
              </span>
            </div>
            {payroll.transactionRef && (
              <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                Txn: {payroll.transactionRef}
              </span>
            )}
          </div>
        )}

        {/* Dual Column: Earnings vs Deductions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Earnings (Inflows) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Earnings & Allowances
              </span>
              <span className="text-[11px] font-mono text-slate-400">Amount</span>
            </div>
            <div className="p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Base Salary</span>
                <span className="font-mono font-medium">
                  ${(payroll.baseSalary || 0).toLocaleString()}
                </span>
              </div>
              {payroll.allowances?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-slate-600 dark:text-slate-400"
                >
                  <span>{item.title}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    +${(item.amount || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-3.5 py-2.5 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Gross Earnings</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                ${grossEarnings.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Deductions (Outflows) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Statutory Deductions
              </span>
              <span className="text-[11px] font-mono text-slate-400">Amount</span>
            </div>
            <div className="p-3.5 space-y-2 text-xs">
              {payroll.deductions?.length > 0 ? (
                payroll.deductions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-slate-600 dark:text-slate-400"
                  >
                    <span>{item.title}</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-medium">
                      -${(item.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  No deductions applied for this period.
                </p>
              )}
            </div>
            <div className="px-3.5 py-2.5 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Total Deductions</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">
                -${(payroll.totalDeductions || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">
              Net Amount Disbursed
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Final credited amount after statutory withholdings
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              ${(payroll.netSalary || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 italic">
          This document is generated by Atlas Enterprise HRMS and serves as an
          official confidential record.
        </p>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Payslip
          </Button>
          <Button type="button" variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
