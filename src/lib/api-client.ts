import type {
  Service,
  Sale,
  DashboardData,
} from "@/types";
import type { ReportsData, Notification } from "@/types";
import type {
  ServiceInput,
  SaleInput,
} from "@/lib/validators";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(data.error || `Request failed with status ${res.status}`, res.status);
  }

  return res.json();
}

export const api = {
  // Services
  getServices: (params?: { category?: string; status?: string }) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.set("category", params.category);
    if (params?.status) sp.set("status", params.status);
    const qs = sp.toString();
    return request<Service[]>(`/api/services${qs ? `?${qs}` : ""}`);
  },

  createService: (data: ServiceInput) =>
    request<Service>("/api/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: ServiceInput) =>
    request<Service>(`/api/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteService: (id: string) =>
    request<{ message: string }>(`/api/services/${id}`, { method: "DELETE" }),

  // Sales
  getSales: (params?: { startDate?: string; endDate?: string; serviceId?: string }) => {
    const sp = new URLSearchParams();
    if (params?.startDate) sp.set("startDate", params.startDate);
    if (params?.endDate) sp.set("endDate", params.endDate);
    if (params?.serviceId) sp.set("serviceId", params.serviceId);
    const qs = sp.toString();
    return request<Sale[]>(`/api/sales${qs ? `?${qs}` : ""}`);
  },

  createSale: (data: SaleInput) =>
    request<Sale>("/api/sales", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSale: (id: string, data: SaleInput) =>
    request<Sale>(`/api/sales/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSale: (id: string) =>
    request<{ message: string }>(`/api/sales/${id}`, { method: "DELETE" }),

  // Dashboard
  getDashboard: () => request<DashboardData>("/api/dashboard"),

  // Reports
  getReports: (params: { period: string; startDate?: string; endDate?: string }) => {
    const sp = new URLSearchParams({ period: params.period });
    if (params.startDate) sp.set("startDate", params.startDate);
    if (params.endDate) sp.set("endDate", params.endDate);
    return request<ReportsData>(`/api/reports?${sp.toString()}`);
  },

  // Notifications
  getNotifications: (unreadOnly?: boolean) =>
    request<Notification[]>(`/api/notifications${unreadOnly ? "?unread=true" : ""}`),

  markNotificationsRead: () =>
    request<{ message: string }>("/api/notifications", { method: "PATCH" }),

  markNotificationRead: (id: string) =>
    request<Notification>(`/api/notifications/${id}`, { method: "PATCH" }),

  deleteNotification: (id: string) =>
    request<{ message: string }>(`/api/notifications/${id}`, { method: "DELETE" }),
};

export { ApiError };
