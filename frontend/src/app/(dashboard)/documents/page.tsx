"use client";

import React, { useState } from "react";
import { FolderKanban, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetDocumentsQuery } from "@/redux/services/documentApi";
import { DocumentTable } from "@/features/documents/components/DocumentTable";
import { UploadDocumentModal } from "@/features/documents/components/UploadDocumentModal";
import { UpdateDocumentStatusModal } from "@/features/documents/components/UpdateDocumentStatusModal";
import { Document } from "@/features/documents/types/document.types";
import { useAppSelector } from "@/redux/hooks";

export default function DocumentsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState<"MY_DOCS" | "ALL_DOCS">("MY_DOCS");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocForUpdate, setSelectedDocForUpdate] = useState<Document | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const isHrOrAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  const { data, isLoading } = useGetDocumentsQuery({
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    category: selectedCategory !== "ALL" ? selectedCategory : undefined,
    search: debouncedSearch.trim() || undefined,
    page,
    limit,
    isMyDocuments: activeTab === "MY_DOCS",
  });

  const rawDocuments = data?.data?.documents || [];
  const meta = data?.data?.pagination || { total: 0 };

  const documents = rawDocuments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <FolderKanban className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Document Vault
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely manage employee identity, education, and employment documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Tabs */}
      {isHrOrAdmin && (
        <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-fit border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => {
              setActiveTab("MY_DOCS");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "MY_DOCS"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            My Documents
          </button>
          <button
            onClick={() => {
              setActiveTab("ALL_DOCS");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "ALL_DOCS"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            All Employees
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex-1 sm:max-w-xs transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document title or employee..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] cursor-pointer"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="ALL">All Categories</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="IDENTITY">Identity</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="EDUCATION">Education</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="EMPLOYMENT">Employment</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="FINANCIAL">Financial</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] cursor-pointer"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="ALL">All Status</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="PENDING_VERIFICATION">Pending</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="VERIFIED">Verified</option>
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-280px)] min-h-[400px]">
        <DocumentTable
          documents={documents}
          isLoading={isLoading}
          canManage={activeTab === "ALL_DOCS" && isHrOrAdmin}
          onUpdateStatus={(doc) => setSelectedDocForUpdate(doc)}
          currentPage={page}
          totalItems={meta.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <UpdateDocumentStatusModal
        isOpen={!!selectedDocForUpdate}
        onClose={() => setSelectedDocForUpdate(null)}
        document={selectedDocForUpdate}
      />
    </div>
  );
}
