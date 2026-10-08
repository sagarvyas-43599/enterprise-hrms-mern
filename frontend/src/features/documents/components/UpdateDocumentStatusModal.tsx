import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Document } from "../types/document.types";
import { useUpdateDocumentStatusMutation } from "@/redux/services/documentApi";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

interface UpdateDocumentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export const UpdateDocumentStatusModal: React.FC<UpdateDocumentStatusModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [updateStatus, { isLoading }] = useUpdateDocumentStatusMutation();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRejectionReason("");
      setShowRejectInput(false);
    }
  }, [isOpen]);

  if (!document) return null;

  const handleUpdate = async (status: "VERIFIED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await updateStatus({
        id: document._id,
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
      }).unwrap();
      
      toast.success(`Document marked as ${status.toLowerCase()}`);
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update document status");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Document"
      description="Review the submitted document and verify its authenticity."
      maxWidth="md"
    >
      <div className="space-y-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Document Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-1">Title</p>
              <p className="font-medium text-slate-900 dark:text-white">{document.title}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Category</p>
              <p className="font-medium text-slate-900 dark:text-white">{document.category}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <a 
              href={document.fileUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Document →
            </a>
          </div>
        </div>

        {showRejectInput ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason for Rejection <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why the document is being rejected..."
              className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowRejectInput(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => handleUpdate("REJECTED")}
                disabled={isLoading || !rejectionReason.trim()}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-900/20"
              onClick={() => setShowRejectInput(true)}
              disabled={isLoading}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Reject Document
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20"
              onClick={() => handleUpdate("VERIFIED")}
              disabled={isLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Verify Document
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
