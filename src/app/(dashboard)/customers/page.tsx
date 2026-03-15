"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { mutate } from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  Users,
  Eye,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { customerSchema, type CustomerInput } from "@/lib/validators";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";


interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const apiUrl = `/api/customers${debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : ""}`;
  const { data: customers, error, isLoading } = useSWR<Customer[]>(apiUrl, fetcher);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      openAddModal();
      router.replace("/customers");
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "", email: "", address: "", notes: "" },
  });

  function openAddModal() {
    setEditingCustomer(null);
    reset({ name: "", phone: "", email: "", address: "", notes: "" });
    setShowModal(true);
  }

  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      notes: customer.notes,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCustomer(null);
    reset();
  }

  async function onSubmit(formData: CustomerInput) {
    setIsSubmitting(true);
    try {
      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "গ্রাহক সংরক্ষণ ব্যর্থ");
      }

      toast.success(
        editingCustomer ? "গ্রাহক আপডেট হয়েছে" : "নতুন গ্রাহক যোগ হয়েছে"
      );
      mutate(apiUrl);
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "কিছু সমস্যা হয়েছে";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(customer: Customer) {
    if (!confirm(`"${customer.name}" মুছে ফেলতে চান?`)) return;
    setDeletingId(customer.id);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("মুছে ফেলা ব্যর্থ");
      toast.success("গ্রাহক মুছে ফেলা হয়েছে");
      mutate(apiUrl);
    } catch {
      toast.error("গ্রাহক মুছে ফেলা ব্যর্থ হয়েছে");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageShell>
      <PageHeader title="গ্রাহক ব্যবস্থাপনা" subtitle="সকল গ্রাহকের তালিকা ও ব্যবস্থাপনা">
        <button
          onClick={openAddModal}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          নতুন গ্রাহক
        </button>
      </PageHeader>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium pl-10"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl mb-6">
          ডাটা লোড করতে সমস্যা হয়েছে।
        </div>
      )}

      {/* Table */}
      <div className="dashboard-card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--bg-muted)] rounded-xl" />
                  <div className="h-4 w-40 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-32 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-48 bg-[var(--bg-muted)] rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
            <p className="empty-state-title">কোনো গ্রাহক পাওয়া যায়নি</p>
            <p className="empty-state-description">
              নতুন গ্রাহক যোগ করতে উপরের বাটনে ক্লিক করুন
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>নাম</th>
                  <th>ফোন</th>
                  <th>ইমেইল</th>
                  <th className="text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, i) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                          <span className="text-xs font-bold text-slate-900">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      {customer.phone ? (
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">--</span>
                      )}
                    </td>
                    <td>
                      {customer.email ? (
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">
                            {customer.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">--</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="p-2 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-blue-600 transition-all duration-200"
                          title="বিস্তারিত"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-amber-600 transition-all duration-200"
                          title="সম্পাদনা"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          disabled={deletingId === customer.id}
                          className="p-2 rounded-lg hover:bg-rose-50 text-[var(--text-secondary)] hover:text-rose-600 transition-all duration-200 disabled:opacity-50"
                          title="মুছুন"
                        >
                          {deletingId === customer.id ? (
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
            className="modal-overlay"
          >
            <div
              className="modal-backdrop"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-content"
            >
              <div className="modal-header">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Sparkles className="w-4 h-4 text-slate-900" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {editingCustomer ? "গ্রাহক সম্পাদনা" : "নতুন গ্রাহক যোগ করুন"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-tertiary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    নাম *
                  </label>
                  <input
                    {...register("name")}
                    className="input-premium"
                    placeholder="গ্রাহকের নাম"
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      ফোন
                    </label>
                    <input
                      {...register("phone")}
                      className="input-premium"
                      placeholder="০১XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      ইমেইল
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="input-premium"
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    ঠিকানা
                  </label>
                  <input
                    {...register("address")}
                    className="input-premium"
                    placeholder="ঠিকানা (ঐচ্ছিক)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    নোট
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    className="input-premium resize-none"
                    placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
                  />
                </div>

                <div className="modal-footer !border-t-0 !p-0 !mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-ghost"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingCustomer ? "আপডেট করুন" : "যোগ করুন"}
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

export default function CustomersPage() {
  return (
    <Suspense>
      <CustomersContent />
    </Suspense>
  );
}
