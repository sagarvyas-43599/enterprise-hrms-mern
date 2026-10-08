import React from "react";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Trash2,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { useDeleteDocumentMutation } from "@/redux/services/documentApi";
import { toast } from "sonner";
import { Document, DocumentStatus } from "../types/document.types";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";

interface DocumentTableProps {
  documents?: Document[];
  isLoading: boolean;
  onUpdateStatus?: (document: Document) => void;
  canManage?: boolean;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents = [],
  isLoading,
  onUpdateStatus,
  canManage = false,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id).unwrap();
        toast.success("Document deleted successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete document");
      }
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="success">VERIFIED</Badge>;
      case "REJECTED":
        return <Badge variant="danger">REJECTED</Badge>;
      case "PENDING_VERIFICATION":
      default:
        return <Badge variant="warning">PENDING</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton cols={5} rows={5} />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Documents Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No documents match the current search or filters. Try adjusting them or upload a new document.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px] inline-block align-middle w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[30%]">
                  Document Details
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[25%]">
                  Employee
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {documents.map((doc) => {
                const emp =
                  typeof doc.employee === "object" && doc.employee
                    ? doc.employee
                    : null;
                const empName = emp
                  ? `${emp.firstName} ${emp.lastName}`
                  : "Unknown Staff";
                const empId = emp?.empId || "EMP";

                return (
                  <tr
                    key={doc._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Title & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {doc.title}
                          </p>
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 mt-0.5 block">
                            {doc.category.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Employee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                          {emp?.firstName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white leading-tight">
                            {empName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {empId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-sm">
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(doc.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center h-7 px-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Open Document"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {canManage && doc.status === "PENDING_VERIFICATION" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus?.(doc);
                            }}
                            className="h-7 px-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Verify Document"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}

                        {!canManage && doc.status === "PENDING_VERIFICATION" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(e, doc._id)}
                            disabled={isDeleting}
                            className="h-7 px-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Delete Document"
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
      </div>

      {onPageChange && onLimitChange && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};
