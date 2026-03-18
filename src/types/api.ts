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

// ReportsData is defined in entities.ts to avoid duplication

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
