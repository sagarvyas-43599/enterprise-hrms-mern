"use client";

import React, { useState } from "react";
import {
  Laptop,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AssetStatsCards } from "@/features/assets/components/AssetStatsCards";
import { AssetTable } from "@/features/assets/components/AssetTable";
import { AddAssetModal } from "@/features/assets/components/AddAssetModal";
import { EditAssetModal } from "@/features/assets/components/EditAssetModal";
import { AllocateAssetModal } from "@/features/assets/components/AllocateAssetModal";
import { ReturnAssetModal } from "@/features/assets/components/ReturnAssetModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  useGetAssetsQuery,
  useGetAssetMetricsQuery,
  useDeleteAssetMutation,
} from "@/redux/services/assetApi";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import {
  Asset,
  AssetCategory,
  AssetStatus,
} from "@/features/assets/types/asset.types";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "ALL", label: "All Categories" },
  { value: "LAPTOP", label: "Laptops & Notebooks" },
  { value: "DESKTOP", label: "Desktops & Workstations" },
  { value: "MONITOR", label: "Monitors & Displays" },
  { value: "MOBILE_PHONE", label: "Mobile Phones & Tablets" },
  { value: "ACCESSORY", label: "Peripherals & Accessories" },
  { value: "OFFICE_EQUIPMENT", label: "Office Equipment" },
  { value: "OTHER", label: "Other Equipment" },
];

const STATUSES: { value: string; label: string }[] = [
  { value: "ALL", label: "All Status" },
  { value: "AVAILABLE", label: "In Stock (Available)" },
  { value: "ALLOCATED", label: "Allocated to Staff" },
  { value: "UNDER_REPAIR", label: "Under Maintenance" },
  { value: "RETIRED", label: "Retired" },
  { value: "LOST", label: "Lost / Missing" },
];

export default function AssetsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedStatus, itemsPerPage]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] =
    useState<Asset | null>(null);
  const [selectedAssetForAllocate, setSelectedAssetForAllocate] =
    useState<Asset | null>(null);
  const [selectedAssetForReturn, setSelectedAssetForReturn] =
    useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const canManage =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  // Fetch Assets
  const {
    data: assetsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAssetsQuery({
    search: debouncedSearch || undefined,
    category:
      selectedCategory !== "ALL"
        ? (selectedCategory as AssetCategory)
        : undefined,
    status:
      selectedStatus !== "ALL" ? (selectedStatus as AssetStatus) : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Fetch Metrics
  const { data: metricsData } = useGetAssetMetricsQuery();

  const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

  const assets: Asset[] = assetsData?.data || [];
  const meta = assetsData?.meta || { total: 0 };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      await deleteAsset(assetToDelete._id).unwrap();
      toast.success(
        `Asset ${assetToDelete.assetTag} (${assetToDelete.name}) removed successfully.`
      );
      setAssetToDelete(null);
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to delete asset.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
            <Laptop className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Asset Inventory & Equipment Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage enterprise IT hardware, serial tracking, laptop
              allocations, return check-ins, and valuation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh
          </Button>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Asset
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Overview */}
      <AssetStatsCards
        assets={assets}
        metrics={metricsData?.data}
        isLoading={isLoading}
      />

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by tag, model, serial, or employee..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Category & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {(selectedCategory !== "ALL" ||
            selectedStatus !== "ALL" ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedStatus("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Assets Table */}
      <AssetTable
        assets={assets}
        isLoading={isLoading || isFetching}
        onAllocate={(asset) => setSelectedAssetForAllocate(asset)}
        onReturn={(asset) => setSelectedAssetForReturn(asset)}
        onEdit={(asset) => setSelectedAssetForEdit(asset)}
        onDelete={(asset) => setAssetToDelete(asset)}
        currentPage={currentPage}
        totalItems={meta.total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={setItemsPerPage}
      />

      {/* Modal 1: Add New Asset */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Modal 2: Edit Asset */}
      <EditAssetModal
        asset={selectedAssetForEdit}
        isOpen={!!selectedAssetForEdit}
        onClose={() => setSelectedAssetForEdit(null)}
      />

      {/* Modal 3: Allocate Asset */}
      <AllocateAssetModal
        asset={selectedAssetForAllocate}
        isOpen={!!selectedAssetForAllocate}
        onClose={() => setSelectedAssetForAllocate(null)}
      />

      {/* Modal 4: Check-in / Return Asset */}
      <ReturnAssetModal
        asset={selectedAssetForReturn}
        isOpen={!!selectedAssetForReturn}
        onClose={() => setSelectedAssetForReturn(null)}
      />

      {/* Modal 5: Delete Confirm Modal (Same as Create Employee Modal theme) */}
      <ConfirmModal
        isOpen={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Retire / Delete Hardware Asset"
        description="Are you sure you want to remove this equipment record from the active inventory database?"
        itemName={assetToDelete?.name}
        itemSubtext={assetToDelete?.assetTag}
        warningNotice="Deleting this asset will permanently remove its serial tracking, custody history, and procurement book value."
        confirmText="Delete Asset"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
