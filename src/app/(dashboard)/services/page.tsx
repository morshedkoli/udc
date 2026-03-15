"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { mutate } from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  Briefcase,
  PackageOpen,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { serviceSchema, type ServiceInput } from "@/lib/validators";
import { formatCurrency } from "@/lib/formatters";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Service {
  id: string;
  name: string;
  description: string;
  defaultPrice: number;
  category: string;
  status: string;
  createdAt: string;
}

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const apiUrl = `/api/services${categoryFilter ? `?category=${encodeURIComponent(categoryFilter)}` : ""}`;
  const { data: services, error, isLoading } = useSWR<Service[]>(apiUrl, fetcher);

  const filteredServices = (services || []).filter((s) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", description: "", defaultPrice: 0, category: "সাধারণ", status: "active" },
  });

  function openAddModal() {
    setEditingService(null);
    reset({ name: "", description: "", defaultPrice: 0, category: "সাধারণ", status: "active" });
    setShowModal(true);
  }

  function openEditModal(service: Service) {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description,
      defaultPrice: service.defaultPrice,
      category: service.category,
      status: service.status as "active" | "inactive",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingService(null);
    reset();
  }

  async function onSubmit(formData: ServiceInput) {
    setIsSubmitting(true);
    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : "/api/services";
      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "সেবা সংরক্ষণ ব্যর্থ");
      }

      toast.success(editingService ? "সেবা আপডেট হয়েছে" : "নতুন সেবা যোগ হয়েছে");
      mutate(apiUrl);
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "কিছু সমস্যা হয়েছে";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(service: Service) {
    if (!confirm(`"${service.name}" মুছে ফেলতে চান?`)) return;
    setDeletingId(service.id);
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("মুছে ফেলা ব্যর্থ");
      toast.success("সেবা মুছে ফেলা হয়েছে");
      mutate(apiUrl);
    } catch {
      toast.error("সেবা মুছে ফেলা ব্যর্থ হয়েছে");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageShell>
      <PageHeader title="সেবা ক্যাটালগ" subtitle="সকল সেবার তালিকা ও ব্যবস্থাপনা">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          নতুন সেবা
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="সেবা খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
        >
          <option value="">সকল ক্যাটাগরি</option>
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-[var(--color-error-light)] border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ডাটা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="h-4 w-40 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-24 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-20 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-16 bg-[var(--bg-muted)] rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <PackageOpen className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              কোনো সেবা পাওয়া যায়নি
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              নতুন সেবা যোগ করতে উপরের বাটনে ক্লিক করুন
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-muted)]">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    নাম
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    ক্যাটাগরি
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    মূল্য
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, i) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate max-w-xs">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <span className="amount-text text-[var(--text-primary)]">
                        {formatCurrency(service.defaultPrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full",
                          service.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {service.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
                          title="সম্পাদনা"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          disabled={deletingId === service.id}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[var(--text-secondary)] hover:text-red-600 transition-colors disabled:opacity-50"
                          title="মুছুন"
                        >
                          {deletingId === service.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[var(--bg-surface)] rounded-[var(--radius-xl)] shadow-xl border border-[var(--border-subtle)] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {editingService ? "সেবা সম্পাদনা" : "নতুন সেবা যোগ করুন"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-tertiary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    সেবার নাম *
                  </label>
                  <input
                    {...register("name")}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                    placeholder="সেবার নাম লিখুন"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    বিবরণ
                  </label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)] resize-none"
                    placeholder="সেবার বিবরণ (ঐচ্ছিক)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      মূল্য (৳) *
                    </label>
                    <input
                      {...register("defaultPrice", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                      placeholder="0"
                    />
                    {errors.defaultPrice && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.defaultPrice.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      ক্যাটাগরি
                    </label>
                    <select
                      {...register("category")}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                    >
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("status", {
                        setValueAs: (v: boolean) => (v ? "active" : "inactive"),
                      })}
                      defaultChecked={
                        editingService ? editingService.status === "active" : true
                      }
                      className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">
                      সক্রিয় সেবা
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-muted)] rounded-lg transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingService ? "আপডেট করুন" : "যোগ করুন"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
