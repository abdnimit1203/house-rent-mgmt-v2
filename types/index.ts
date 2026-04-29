// ─── House Lord ─────────────────────────────────────────────────────────────
export interface IHouseLord {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Room ────────────────────────────────────────────────────────────────────
export interface IRoom {
  _id: string;
  houseLordId: string;
  roomNumber: string;
  floor?: string;
  hasWaterBill: boolean;
  isOccupied: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Tenant ──────────────────────────────────────────────────────────────────
export interface ITenant {
  _id: string;
  houseLordId: string;
  name: string;
  phone: string;
  roomId: string;
  room?: IRoom;
  category?: string;
  monthlyRent: number;
  advance?: number;
  startMonth?: number;
  startYear?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Meter Reading ───────────────────────────────────────────────────────────
export interface IMeterReading {
  _id: string;
  houseLordId: string;
  tenantId: string;
  tenant?: ITenant;
  month: number;
  year: number;
  previousReading: number;
  currentReading: number;
  unitsUsed: number;
  perUnitRate: number;
  electricityBill: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Water Bill Entry ────────────────────────────────────────────────────────
export interface IWaterBillEntry {
  _id: string;
  houseLordId: string;
  roomId: string;
  room?: IRoom;
  month: number;
  year: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface IPayment {
  _id: string;
  houseLordId: string;
  tenantId: string;
  tenant?: ITenant;
  month: number;
  year: number;
  rent: number;
  electricityBill: number;
  waterBill: number;
  previousDue: number;
  totalBill: number;
  amountPaid: number;
  due: number;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────
export interface ISettings {
  _id: string;
  houseLordId: string;
  perUnitRate: number;
  defaultWaterBill: number;
  updatedAt: string;
}

// ─── Advertisement ───────────────────────────────────────────────────────────
export interface IAdvertisementDoc {
  _id: string;
  houseLordId: string | IHouseLord;
  type: 'rent' | 'sale';
  price: number;
  roomSize?: string;
  imageUrl?: string;
  description?: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface IDashboardStats {
  totalTenants: number;
  paidTenants: number;
  unpaidTenants: number;
  partialTenants: number;
  totalBillAmount: number;
  totalCollected: number;
  totalDue: number;
  tenantSummaries: ITenantSummary[];
}

export interface ITenantSummary {
  tenant: ITenant;
  payment?: IPayment;
  status: PaymentStatus | 'no-bill';
}

// ─── API Helpers ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}
