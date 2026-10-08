"use client";

import React from "react";
import {
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  HardDrive,
  Package,
  UserPlus,
  Undo2,
  Pencil,
  Trash2,
  Shield,
  Calendar,
  DollarSign,
  AlertCircle,
  Building,
} from "lucide-react";
import {
  Asset,
  AssetCategory,
  AssetStatus,
  AssetCondition,
} from "../types/asset.types";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/SkeletonLoader";
import { formatDate } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { Pagination } from "@/components/ui/Pagination";

interface AssetTableProps {
  assets?: Asset[];
  isLoading: boolean;
  onAllocate?: (asset: Asset) => void;
  onReturn?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets = [],
  isLoading,
  onAllocate,
  onReturn,
  onEdit,
  onDelete,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const canManage =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case "LAPTOP":
        return <Laptop className="w-4 h-4 text-blue-500" />;
      case "MONITOR":
        return <Monitor className="w-4 h-4 text-indigo-500" />;
      case "MOBILE_PHONE":
        return <Smartphone className="w-4 h-4 text-purple-500" />;
      case "ACCESSORY":
        return <Headphones className="w-4 h-4 text-emerald-500" />;
      case "DESKTOP":
        return <HardDrive className="w-4 h-4 text-amber-500" />;
      case "OFFICE_EQUIPMENT":
      case "OTHER":
      default:
        return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success">IN STOCK</Badge>;
      case "ALLOCATED":
        return <Badge variant="info">ALLOCATED</Badge>;
      case "UNDER_REPAIR":
        return <Badge variant="warning">UNDER REPAIR</Badge>;
      case "RETIRED":
        return <Badge variant="danger">RETIRED</Badge>;
      case "LOST":
        return <Badge variant="neutral">LOST</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: AssetCondition) => {
    switch (condition) {
      case "NEW":
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
            NEW
          </span>
        );
      case "EXCELLENT":
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
            EXCELLENT
          </span>
        );
      case "GOOD":
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            GOOD
          </span>
        );
      case "FAIR":
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
            FAIR
          </span>
        );
      case "DAMAGED":
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
            DAMAGED
          </span>
        );
      default:
        return <span className="text-[11px] text-slate-400">{condition}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
          <Laptop className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No Hardware Assets Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No equipment matching the selected filter. Click Add New Asset to
          register laptops, monitors, and company hardware into inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
              <th className="py-3.5 px-4">Hardware Item & Tag</th>
              <th className="py-3.5 px-4">Brand & Serial</th>
              <th className="py-3.5 px-4">Allocation Custody</th>
              <th className="py-3.5 px-4">Condition</th>
              <th className="py-3.5 px-4">Valuation & Warranty</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {assets.map((asset) => {
              const emp =
                typeof asset.allocatedTo === "object" && asset.allocatedTo
                  ? asset.allocatedTo
                  : null;

              return (
                <tr
                  key={asset._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Hardware Item & Tag */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {getCategoryIcon(asset.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {asset.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                            {asset.assetTag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {asset.category.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Brand & Serial Number */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-900 dark:text-white block">
                      {asset.brand}{" "}
                      {asset.modelNumber ? `• ${asset.modelNumber}` : ""}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                      S/N: {asset.serialNumber}
                    </span>
                  </td>

                  {/* Custody / Allocated To */}
                  <td className="py-3.5 px-4">
                    {emp ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px] uppercase">
                          {emp.firstName?.charAt(0) || "E"}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block text-xs">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {emp.empId}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        In Storage
                      </span>
                    )}
                  </td>

                  {/* Physical Condition */}
                  <td className="py-3.5 px-4">
                    {getConditionBadge(asset.condition)}
                  </td>

                  {/* Valuation & Warranty */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
                      ${(asset.purchaseCost || 0).toLocaleString()}
                    </div>
                    {asset.warrantyExpiry && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Shield className="w-3 h-3 text-slate-400" />
                        <span>Exp: {formatDate(asset.warrantyExpiry)}</span>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(asset.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Allocate button if Available */}
                      {canManage && asset.status === "AVAILABLE" && (
                        <button
                          type="button"
                          onClick={() => onAllocate?.(asset)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors inline-flex items-center gap-1"
                          title="Assign hardware to employee"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      )}

                      {/* Return button if Allocated */}
                      {canManage && asset.status === "ALLOCATED" && (
                        <button
                          type="button"
                          onClick={() => onReturn?.(asset)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors inline-flex items-center gap-1"
                          title="Check-in returned equipment"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Check-in</span>
                        </button>
                      )}

                      {/* Edit button */}
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onEdit?.(asset)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="Edit asset details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete button */}
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(asset)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                          title="Delete asset from inventory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange || (() => {})}
          />
        </div>
      )}
    </div>
  );
};
