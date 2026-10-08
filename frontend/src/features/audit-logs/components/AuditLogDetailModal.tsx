"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  Clock,
  User,
  Globe,
  Tag,
  Copy,
  Check,
  Code2,
  Terminal,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  AuditLog,
  getActionBadgeClass,
  getEntityBadgeClass,
  formatActionText,
} from "../types/auditLog.types";

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const payload = log.details || log.metadata || {};
  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("Audit event payload copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Event Inspection"
      description={`Log Record ID: ${log._id}`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Header Badges Bar */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <span
            className={`px-2.5 py-1 rounded-md font-mono font-bold border ${getActionBadgeClass(
              log.action
            )}`}
          >
            {formatActionText(log.action)}
          </span>

          <span
            className={`px-2.5 py-1 rounded-md font-semibold border ${getEntityBadgeClass(
              log.entity
            )}`}
          >
            {formatActionText(log.entity)}
          </span>

          <div className="ml-auto flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(log.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {/* Actor & Origin Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Actor Profile */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Actor & Identity</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {log.actorEmail || "System Automation / Internal"}
              </p>
              <p className="font-mono text-[11px] text-slate-500 mt-0.5 truncate">
                Actor ID: {log.actorId || "N/A"}
              </p>
            </div>
          </div>

          {/* Network & Device */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Origin & Network</span>
            </div>
            <div>
              <p className="font-mono font-semibold text-slate-900 dark:text-white">
                IP: {log.ipAddress === "unknown" ? "127.0.0.1" : (log.ipAddress || "::1 (Local)")}
              </p>
              {log.userAgent && log.userAgent !== "unknown" && log.userAgent !== "Unknown Device" && (
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1" title={log.userAgent}>
                  {log.userAgent}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Target Entity Reference */}
        {log.entityId && (
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Target Entity Reference ID:
              </span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded">
              {log.entityId}
            </span>
          </div>
        )}

        {/* Raw Event Payload Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Event Payload & Details JSON</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          <pre className="max-h-60 overflow-y-auto p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800">
            {jsonString !== "{}" ? jsonString : "// No auxiliary metadata captured for this event."}
          </pre>
        </div>

        {/* Modal Close Action */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
};
