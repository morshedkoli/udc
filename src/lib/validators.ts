import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string(),
  defaultPrice: z.number().min(0, "Price must be 0 or greater"),
  category: z.string(),
  status: z.enum(["active", "inactive"]),
});

export const saleSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  customerName: z.string().optional(),
  customerGender: z.enum(["male", "female", "other"]),
  price: z.number().min(0, "Price must be 0 or greater"),
  quantity: z.number().min(1, "Quantity must be at least 1").default(1),
  saleDate: z.string().optional(),
  notes: z.string(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export type SaleInput = z.infer<typeof saleSchema>;

// Customer schema for QuickAddModal compatibility
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
