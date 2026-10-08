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

export interface EmployeeRef {
  _id: string;
  empId: string;
  firstName: string;
  lastName: string;
  department?: string;
  designation?: string;
  email?: string;
}

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
  allocatedTo?: EmployeeRef | string | null;
  allocatedAt?: string | null;
  purchaseCost?: number;
  purchaseDate?: string;
  warrantyExpiry?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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
