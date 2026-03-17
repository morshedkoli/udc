// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Core entities (serialized - dates as strings from JSON)
export interface Service extends BaseEntity {
  name: string;
  description: string;
  defaultPrice: number;
  category: string;
  status: ServiceStatus;
}

export interface Sale extends BaseEntity {
  serviceId: string;
  customerName: string;
  customerGender: Gender;
  price: number;
  saleDate: string;
  notes: string;
  service?: Service;
}

// Enums as union types
export type ServiceStatus = "active" | "inactive";
export type Gender = "male" | "female" | "other";

export interface DashboardData {
  todayRevenue: number;
  totalRevenue: number;
  totalSales: number;
  totalServices: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentSales: Sale[];
}

export interface ReportsData {
  sales: Sale[];
  totalRevenue: number;
  totalSales: number;
  chartData: { date: string; revenue: number }[];
  topServices: { name: string; count: number; revenue: number }[];
  periodStart: string;
  periodEnd: string;
}
