"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, ClipboardCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { serviceSchema } from "@/lib/validators";
import type { ServiceInput } from "@/lib/validators";
import { SERVICE_CATEGORIES } from "@/lib/constants";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "service" | "record";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "service", label: "New Service", icon: Briefcase },
  { key: "record", label: "Record Service", icon: ClipboardCheck },
];

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("service");
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
              {activeTab === "service" && (
                <QuickAddServiceForm
                  onSuccess={() => {
                    onOpenChange(false);
                    router.refresh();
                  }}
                />
              )}
              {activeTab === "record" && (
                <div className="text-center py-6">
                  <ClipboardCheck className="w-10 h-10 text-[var(--brand-primary)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Use the Services page to record a provided service, or go to the full form.
                  </p>
                  <button
                    onClick={() => { onOpenChange(false); router.push("/assignments/new"); }}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Record Service (Full Form)
                  </button>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-muted)]">
              <p className="text-xs text-[var(--text-tertiary)]">
                To record a service quickly, click the ✓ icon on any service row in the Services page.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
