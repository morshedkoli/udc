import type {
  Customer,
  CustomerDetail,
  Service,
  AssignmentWithRelations,
  PaymentWithRelations,
  DashboardData,
  ActivityLog,
} from "@/types";
import type { SearchResult, ReportsData, Notification } from "@/types";
import type {
  CustomerInput,
  ServiceInput,
  AssignmentInput,
  PaymentInput,
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
  // Customers
  getCustomers: (query?: string) =>
    request<Customer[]>(`/api/customers${query ? `?q=${encodeURIComponent(query)}` : ""}`),

  getCustomer: (id: string) =>
    request<CustomerDetail>(`/api/customers/${id}`),

  createCustomer: (data: CustomerInput) =>
    request<Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCustomer: (id: string, data: CustomerInput) =>
    request<Customer>(`/api/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCustomer: (id: string) =>
    request<{ message: string }>(`/api/customers/${id}`, { method: "DELETE" }),

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

  // Assignments
  getAssignments: (params?: { customerId?: string; serviceId?: string; status?: string }) => {
    const sp = new URLSearchParams();
    if (params?.customerId) sp.set("customerId", params.customerId);
    if (params?.serviceId) sp.set("serviceId", params.serviceId);
    if (params?.status) sp.set("status", params.status);
    const qs = sp.toString();
    return request<AssignmentWithRelations[]>(`/api/assignments${qs ? `?${qs}` : ""}`);
  },

  createAssignment: (data: AssignmentInput) =>
    request<AssignmentWithRelations>("/api/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteAssignment: (id: string) =>
    request<{ message: string }>(`/api/assignments/${id}`, { method: "DELETE" }),

  // Payments
  getPayments: (assignmentId?: string) =>
    request<PaymentWithRelations[]>(
      `/api/payments${assignmentId ? `?assignmentId=${assignmentId}` : ""}`
    ),

  createPayment: (data: PaymentInput) =>
    request<PaymentWithRelations>("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboard: () => request<DashboardData>("/api/dashboard"),

  // Search
  search: (query: string) =>
    request<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}`),

  // Activity
  getActivity: (params?: { type?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.type) sp.set("type", params.type);
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return request<ActivityLog[]>(`/api/activity${qs ? `?${qs}` : ""}`);
  },

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
