import { baseApi } from "../api/baseApi";

export type AssetCategory =
  | "LAPTOP"
  | "DESKTOP"
  | "MONITOR"
  | "MOBILE_PHONE"
  | "ACCESSORY"
  | "OFFICE_EQUIPMENT"
  | "OTHER";

export type AssetStatus =
  | "AVAILABLE"
  | "ALLOCATED"
  | "UNDER_REPAIR"
  | "RETIRED"
  | "LOST";

export type AssetCondition =
  | "NEW"
  | "EXCELLENT"
  | "GOOD"
  | "FAIR"
  | "DAMAGED";

export interface Asset {
  _id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  brand: string;
  modelNumber?: string;
  serialNumber: string;
  condition: AssetCondition;
  status: AssetStatus;
  allocatedTo?: {
    _id: string;
    empId: string;
    firstName: string;
    lastName: string;
    department: string;
  } | string | null;
  allocatedAt?: string;
  purchaseCost?: number;
  purchaseDate?: string;
  warrantyExpiry?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssetPayload {
  assetTag: string;
  name: string;
  category: AssetCategory;
  brand: string;
  modelNumber?: string;
  serialNumber: string;
  condition?: AssetCondition;
  purchaseCost?: number;
  purchaseDate?: string;
  warrantyExpiry?: string | null;
  notes?: string;
}

export interface UpdateAssetPayload {
  name?: string;
  brand?: string;
  modelNumber?: string;
  condition?: AssetCondition;
  status?: AssetStatus;
  purchaseCost?: number;
  warrantyExpiry?: string | null;
  notes?: string;
}

export interface AllocateAssetPayload {
  employeeId: string;
  notes?: string;
}

export interface ReturnAssetPayload {
  condition: AssetCondition;
  notes?: string;
}

export interface AssetsQueryParams {
  category?: AssetCategory;
  status?: AssetStatus;
  allocatedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AssetMetrics {
  totalCount?: number;
  totalAssets?: number;
  available?: number;
  availableCount?: number;
  allocated?: number;
  allocatedCount?: number;
  underRepair?: number;
  maintenanceCount?: number;
  totalValue?: number;
  totalValuation?: number;
  retired?: number;
}

export const assetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. List assets
    getAssets: builder.query<
      {
        success: boolean;
        data: Asset[];
        meta?: { total: number; page: number; limit: number; totalPages: number };
      },
      AssetsQueryParams | void
    >({
      query: (params) => ({
        url: "/assets",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Asset" as const,
                id: _id,
              })),
              { type: "Asset", id: "LIST" },
            ]
          : [{ type: "Asset", id: "LIST" }],
    }),

    // 2. Employee self-service allocated assets
    getMyAssets: builder.query<{ success: boolean; data: Asset[] }, void>({
      query: () => ({
        url: "/assets/my-assets",
        method: "GET",
      }),
      providesTags: [{ type: "Asset", id: "MY_ASSETS" }],
    }),

    // 3. Asset inventory valuation metrics
    getAssetMetrics: builder.query<{ success: boolean; data: AssetMetrics }, void>({
      query: () => ({
        url: "/assets/metrics",
        method: "GET",
      }),
      providesTags: [{ type: "Asset", id: "METRICS" }],
    }),

    // 4. Create new asset
    createAsset: builder.mutation<
      { success: boolean; data: Asset; message: string },
      CreateAssetPayload
    >({
      query: (body) => ({
        url: "/assets",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Asset", id: "LIST" },
        { type: "Asset", id: "METRICS" },
      ],
    }),

    // 5. Update asset details
    updateAsset: builder.mutation<
      { success: boolean; data: Asset; message: string },
      { id: string; body: UpdateAssetPayload }
    >({
      query: ({ id, body }) => ({
        url: `/assets/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Asset", id },
        { type: "Asset", id: "LIST" },
        { type: "Asset", id: "METRICS" },
      ],
    }),

    // 6. Allocate asset to employee
    allocateAsset: builder.mutation<
      { success: boolean; data: Asset; message: string },
      { id: string; body: AllocateAssetPayload }
    >({
      query: ({ id, body }) => ({
        url: `/assets/${id}/allocate`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Asset", id },
        { type: "Asset", id: "LIST" },
        { type: "Asset", id: "MY_ASSETS" },
        { type: "Asset", id: "METRICS" },
      ],
    }),

    // 7. Return asset
    returnAsset: builder.mutation<
      { success: boolean; data: Asset; message: string },
      { id: string; body: ReturnAssetPayload }
    >({
      query: ({ id, body }) => ({
        url: `/assets/${id}/return`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Asset", id },
        { type: "Asset", id: "LIST" },
        { type: "Asset", id: "MY_ASSETS" },
        { type: "Asset", id: "METRICS" },
      ],
    }),

    // 8. Delete asset
    deleteAsset: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/assets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Asset", id: "LIST" },
        { type: "Asset", id: "METRICS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAssetsQuery,
  useGetMyAssetsQuery,
  useGetAssetMetricsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useAllocateAssetMutation,
  useReturnAssetMutation,
  useDeleteAssetMutation,
} = assetApi;
