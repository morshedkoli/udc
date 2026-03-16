// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Core entities (serialized - dates as strings from JSON)
export interface Customer extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface Service extends BaseEntity {
  name: string;
  description: string;
  defaultPrice: number;
  category: string;
  status: ServiceStatus;
}

export interface ServiceAssignment extends BaseEntity {
  customerId: string;
  serviceId: string;
  customPrice: number;
  assignedDate: string;
  status: AssignmentStatus;
  notes: string;
}

export interface Payment {
  id: string;
  assignmentId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  notes: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: EntityType;
  entityId: string;
  details: string;
  userId?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
}

// Relation-included variants (what API routes return)
export interface AssignmentWithRelations extends ServiceAssignment {
  customer: Pick<Customer, "id" | "name">;
  service: Pick<Service, "id" | "name">;
  payments?: Payment[];
}

export interface PaymentWithRelations extends Payment {
  assignment: {
    id: string;
    customPrice: number;
    status: string;
    customer: Pick<Customer, "id" | "name">;
    service: Pick<Service, "id" | "name">;
  };
}

export interface CustomerDetail extends Customer {
  assignments: (ServiceAssignment & {
    service: Pick<Service, "id" | "name" | "category">;
    payments: Payment[];
  })[];
  assignmentsCount: number;
  totalPayments: number;
}

export interface DashboardData {
  todayRevenue: number;
  totalRevenue: number;
  totalCustomers: number;
  totalServices: number;
  pendingAmount: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentActivity: ActivityLog[];
}

// Enums as union types
export type PaymentMethod = "cash" | "bkash" | "nagad" | "bank" | "other";
export type AssignmentStatus = "active" | "completed" | "cancelled";
export type ServiceStatus = "active" | "inactive";
export type EntityType =
  | "customer"
  | "service"
  | "assignment"
  | "payment"
  | "user";
