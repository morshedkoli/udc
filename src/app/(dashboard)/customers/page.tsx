"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { customerSchema, type CustomerInput } from "@/lib/validators";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

export default function CustomersPage() {
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

  // Open modal if ?new=true
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
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          নতুন গ্রাহক
        </button>
      </PageHeader>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[var(--color-error-light)] border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ডাটা লোড করতে সমস্যা হয়েছে।
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-8 h-8 bg-[var(--bg-muted)] rounded-full" />
                  <div className="h-4 w-36 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-28 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-40 bg-[var(--bg-muted)] rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              কোনো গ্রাহক পাওয়া যায়নি
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              নতুন গ্রাহক যোগ করতে উপরের বাটনে ক্লিক করুন
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
                    ফোন
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    ইমেইল
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, i) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--brand-primary-light)] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[var(--brand-primary)]">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      {customer.phone ? (
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      {customer.email ? (
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">
                            {customer.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
                          title="বিস্তারিত"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
                          title="সম্পাদনা"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          disabled={deletingId === customer.id}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[var(--text-secondary)] hover:text-red-600 transition-colors disabled:opacity-50"
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
                  {editingCustomer ? "গ্রাহক সম্পাদনা" : "নতুন গ্রাহক যোগ করুন"}
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
                    নাম *
                  </label>
                  <input
                    {...register("name")}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                    placeholder="গ্রাহকের নাম"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      ফোন
                    </label>
                    <input
                      {...register("phone")}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                      placeholder="০১XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      ইমেইল
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    ঠিকানা
                  </label>
                  <input
                    {...register("address")}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                    placeholder="ঠিকানা (ঐচ্ছিক)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    নোট
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)] resize-none"
                    placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
                  />
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
