import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string(),
  email: z.string().email("Please enter a valid email").or(z.literal("")),
  address: z.string(),
  notes: z.string(),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string(),
  defaultPrice: z.number().min(0, "Price must be 0 or greater"),
  category: z.string(),
  status: z.enum(["active", "inactive"]),
});

export const assignmentSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  serviceId: z.string().min(1, "Please select a service"),
  customPrice: z.number().min(0, "Price must be 0 or greater"),
  assignedDate: z.string().optional(),
  status: z.enum(["active", "completed", "cancelled"]),
  notes: z.string(),
});

export const paymentSchema = z.object({
  assignmentId: z.string().min(1, "Please select an assignment"),
  amount: z.number().min(1, "Amount must be 1 or greater"),
  paymentDate: z.string().optional(),
  method: z.enum(["cash", "bkash", "nagad", "bank", "other"]),
  notes: z.string(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
