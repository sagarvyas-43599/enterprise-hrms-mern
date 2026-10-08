"use client";

import React from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  itemName?: string;
  itemSubtext?: string;
  warningNotice?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemSubtext,
  warningNotice,
  confirmText = "Delete Record",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Selected Target Entity Information Card */}
        {itemName && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Selected Record
              </span>
              {itemSubtext && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {itemSubtext}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
              {itemName}
            </p>
          </div>
        )}

        {/* Enterprise Notice Callout */}
        <div
          className={
            variant === "danger"
              ? "p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex items-start gap-2.5"
              : "p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5"
          }
        >
          {variant === "danger" ? (
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">
              {variant === "danger" ? "Permanent Deletion: " : "Action Confirmation: "}
            </span>
            {warningNotice ||
              (variant === "danger"
                ? "This operation is permanent and cannot be undone. All associated records and permissions will be removed."
                : "Please confirm that you want to proceed with this operation.")}
          </div>
        </div>

        {/* Modal Action Buttons - Identical styling and positioning as AddEmployeeModal */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            leftIcon={variant === "danger" ? <Trash2 className="w-4 h-4" /> : undefined}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
