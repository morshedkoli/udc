"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Briefcase, ClipboardList, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { customerSchema, serviceSchema } from "@/lib/validators";
import type { CustomerInput, ServiceInput } from "@/lib/validators";
import { SERVICE_CATEGORIES } from "@/lib/constants";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "customer" | "service";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "customer", label: "Customer", icon: Users },
  { key: "service", label: "Service", icon: Briefcase },
];

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("customer");
  const router = useRouter();

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Add</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab.key
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {activeTab === "customer" && (
                <QuickAddCustomerForm
                  onSuccess={() => {
                    onOpenChange(false);
                    router.refresh();
                  }}
                />
              )}
              {activeTab === "service" && (
                <QuickAddServiceForm
                  onSuccess={() => {
                    onOpenChange(false);
                    router.refresh();
                  }}
                />
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-muted)]">
              <p className="text-xs text-[var(--text-tertiary)]">
                For assignments and payments, use the full forms in their respective pages.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function QuickAddCustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
  });

  async function onSubmit(data: CustomerInput) {
    setLoading(true);
    try {
      await api.createCustomer(data);
      toast.success("Customer created successfully");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name *</label>
        <input {...register("name")} className="input-premium w-full" placeholder="Customer name" />
        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
          <input {...register("phone")} className="input-premium w-full" placeholder="Phone number" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
          <input {...register("email")} className="input-premium w-full" placeholder="Email" />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Add Customer
      </button>
    </form>
  );
}

function QuickAddServiceForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { status: "active", category: "General" },
  });

  async function onSubmit(data: ServiceInput) {
    setLoading(true);
    try {
      await api.createService(data);
      toast.success("Service created successfully");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name *</label>
        <input {...register("name")} className="input-premium w-full" placeholder="Service name" />
        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Price</label>
          <input {...register("defaultPrice", { valueAsNumber: true })} type="number" min="0" className="input-premium w-full" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
          <select {...register("category")} className="input-premium w-full">
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Add Service
      </button>
    </form>
  );
}
