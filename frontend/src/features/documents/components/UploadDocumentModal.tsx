import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileText, AlertCircle } from "lucide-react";
import {
  uploadDocumentSchema,
  UploadDocumentFormData,
} from "@/validations/document.schema";
import { useUploadDocumentMutation } from "@/redux/services/documentApi";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOCUMENT_CATEGORIES = [
  { value: "IDENTITY", label: "Identity (Aadhar, PAN, Passport)" },
  { value: "EDUCATION", label: "Education (Degree, Certificates)" },
  { value: "EMPLOYMENT", label: "Employment (Offer, Relieving)" },
  { value: "FINANCIAL", label: "Financial (Bank, Tax)" },
  { value: "OTHER", label: "Other" },
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      fileSize: 1024,
      fileType: "application/pdf"
    },
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: UploadDocumentFormData) => {
    try {
      await uploadDocument(data).unwrap();
      toast.success("Document uploaded successfully");
      onClose();
    } catch (error: any) {
      console.error("Failed to upload document:", error);
      const msg = error?.data?.message || error?.message || "Failed to upload document";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      description="Upload an identity or company-related document for verification."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Document Title"
          placeholder="e.g. Employee Pan Card"
          required
          {...register("title")}
          error={errors.title?.message}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("category")}
            className={`w-full h-10 px-3 rounded-xl border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
              errors.category?.message
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500"
            }`}
          >
            <option value="">Select category...</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.category.message as string}
            </p>
          )}
        </div>

        <Input
          label="Document URL"
          placeholder="https://s3.amazonaws.com/..."
          required
          {...register("fileUrl")}
          error={errors.fileUrl?.message}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            {isLoading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
