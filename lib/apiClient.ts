import axios from 'axios';
import type {
  IHouseLord, IRoom, ITenant, IMeterReading,
  IWaterBillEntry, IPayment, ISettings, IDashboardStats, IAdvertisementDoc
} from '@/types';

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    http.post<{ user: IHouseLord }>('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    http.post<{ user: IHouseLord }>('/auth/register', data),
  logout: () => http.post('/auth/logout'),
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => http.get<IHouseLord>('/profile'),
  update: (data: Partial<Pick<IHouseLord, 'name' | 'phone' | 'address'>>) =>
    http.put<IHouseLord>('/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.put('/profile/password', { currentPassword, newPassword }),
};

// ─── Rooms ────────────────────────────────────────────────────────────────────
export const roomsApi = {
  list: () => http.get<IRoom[]>('/rooms'),
  get: (id: string) => http.get<IRoom>(`/rooms/${id}`),
  create: (data: Partial<IRoom>) =>
    http.post<IRoom>('/rooms', data),
  update: (id: string, data: Partial<IRoom>) => http.put<IRoom>(`/rooms/${id}`, data),
  remove: (id: string) => http.delete(`/rooms/${id}`),
};

// ─── Tenants ─────────────────────────────────────────────────────────────────
export const tenantsApi = {
  list: () => http.get<ITenant[]>('/tenants'),
  get: (id: string) => http.get<ITenant>(`/tenants/${id}`),
  create: (data: Partial<ITenant>) =>
    http.post<ITenant>('/tenants', data),
  update: (id: string, data: Partial<ITenant>) => http.put<ITenant>(`/tenants/${id}`, data),
  remove: (id: string) => http.delete(`/tenants/${id}`),
};

// ─── Meter Readings ──────────────────────────────────────────────────────────
export const meterReadingsApi = {
  list: (month?: number, year?: number) =>
    http.get<IMeterReading[]>('/meter-readings', { params: { month, year } }),
  get: (id: string) => http.get<IMeterReading>(`/meter-readings/${id}`),
  create: (data: Partial<IMeterReading>) =>
    http.post<IMeterReading>('/meter-readings', data),
  update: (id: string, data: Partial<IMeterReading>) =>
    http.put<IMeterReading>(`/meter-readings/${id}`, data),
  remove: (id: string) => http.delete(`/meter-readings/${id}`),
};

// ─── Water Bills ─────────────────────────────────────────────────────────────
export const waterBillsApi = {
  list: (month?: number, year?: number) =>
    http.get<IWaterBillEntry[]>('/water-bills', { params: { month, year } }),
  get: (id: string) => http.get<IWaterBillEntry>(`/water-bills/${id}`),
  create: (data: Partial<IWaterBillEntry>) =>
    http.post<IWaterBillEntry>('/water-bills', data),
  update: (id: string, data: Partial<IWaterBillEntry>) =>
    http.put<IWaterBillEntry>(`/water-bills/${id}`, data),
  remove: (id: string) => http.delete(`/water-bills/${id}`),
};

// ─── Advertisements ──────────────────────────────────────────────────────────
export const advertisementsApi = {
  list: () => http.get<IAdvertisementDoc[]>('/advertisements'),
  get: (id: string) => http.get<IAdvertisementDoc>(`/advertisements/${id}`),
  create: (data: Partial<IAdvertisementDoc>) => http.post<IAdvertisementDoc>('/advertisements', data),
  update: (id: string, data: Partial<IAdvertisementDoc>) => http.put<IAdvertisementDoc>(`/advertisements/${id}`, data),
  remove: (id: string) => http.delete(`/advertisements/${id}`),
};

export const publicAdvertisementsApi = {
  list: () => http.get<IAdvertisementDoc[]>('/public/to-let'),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentsApi = {
  list: (month?: number, year?: number) =>
    http.get<IPayment[]>('/payments', { params: { month, year } }),
  get: (id: string) => http.get<IPayment>(`/payments/${id}`),
  /** Generate a new bill for a tenant-month (validates water bills) */
  generate: (tenantId: string, month: number, year: number) =>
    http.post<IPayment>('/payments/generate', { tenantId, month, year }),
  /** Record payment against an existing bill */
  recordPayment: (id: string, amountPaid: number) =>
    http.put<IPayment>(`/payments/${id}/pay`, { amountPaid }),
  update: (id: string, data: Partial<IPayment>) => http.put<IPayment>(`/payments/${id}`, data),
  remove: (id: string) => http.delete(`/payments/${id}`),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: (month: number, year: number) =>
    http.get<IDashboardStats>('/dashboard', { params: { month, year } }),
};

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => http.get<ISettings>('/settings'),
  update: (data: Partial<Pick<ISettings, 'perUnitRate' | 'defaultWaterBill'>>) =>
    http.put<ISettings>('/settings', data),
};
