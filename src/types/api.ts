export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface SearchResult {
  type: "customer" | "service" | "assignment";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface ReportsData {
  assignments: import("./entities").AssignmentWithRelations[];
  totalRevenue: number;
  totalAssignments: number;
  topServices: { name: string; count: number; revenue: number }[];
  chartData: { date: string; revenue: number }[];
  pendingPayments: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  entityType?: string;
  entityId?: string;
  href?: string;
  createdAt: string;
}
