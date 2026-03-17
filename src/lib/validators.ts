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
  customerName: z.string().min(1, "Customer name is required"),
  customerGender: z.enum(["male", "female", "other"]),
  price: z.number().min(0, "Price must be 0 or greater"),
  saleDate: z.string().optional(),
  notes: z.string(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
