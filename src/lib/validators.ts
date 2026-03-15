import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "নাম আবশ্যক"),
  phone: z.string(),
  email: z.string().email("সঠিক ইমেইল দিন").or(z.literal("")),
  address: z.string(),
  notes: z.string().optional().default(""),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "সেবার নাম আবশ্যক"),
  description: z.string(),
  defaultPrice: z.number().min(0, "মূল্য ০ বা তার বেশি হতে হবে"),
  category: z.string(),
  status: z.enum(["active", "inactive"]),
});

export const assignmentSchema = z.object({
  customerId: z.string().min(1, "গ্রাহক নির্বাচন করুন"),
  serviceId: z.string().min(1, "সেবা নির্বাচন করুন"),
  customPrice: z.number().min(0, "মূল্য ০ বা তার বেশি হতে হবে"),
  assignedDate: z.string().optional(),
  status: z.enum(["active", "completed", "cancelled"]),
  notes: z.string().optional().default(""),
});

export const paymentSchema = z.object({
  assignmentId: z.string().min(1, "বরাদ্দ নির্বাচন করুন"),
  amount: z.number().min(1, "পরিমাণ ১ বা তার বেশি হতে হবে"),
  paymentDate: z.string().optional(),
  method: z.enum(["cash", "bkash", "nagad", "bank", "other"]),
  notes: z.string().optional().default(""),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
