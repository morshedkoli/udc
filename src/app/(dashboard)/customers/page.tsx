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
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import type { Customer } from "@/types";

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
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
        toast.success("Customer updated successfully");
      } else {
        await api.createCustomer(formData);
        toast.success("Customer added successfully");
      }
      mutate(apiUrl);
      closeModal();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(customer: Customer) {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    setDeletingId(customer.id);
    try {
      await api.deleteCustomer(customer.id);
      toast.success("Customer deleted successfully");
      mutate(apiUrl);
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageShell>
      <PageHeader title="Customer Management" subtitle="Manage all customers">
        <button
          onClick={openAddModal}
          className="btn btn-primary"
        >
          <Plus />
          New Customer
        </button>
      </PageHeader>

      {/* Search */}
      <div className="search-box">
        <div className="search-box-inner">
          <Search className="search-box-icon" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box-input"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          Failed to load data.
        </div>
      )}

      {/* Table */}
      <div className="dashboard-card">
        {isLoading ? (
          <div className="p-6">
            <div className="skeleton-list">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              ))}
            </div>
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users />
            </div>
            <p className="empty-state-title">No customers found</p>
            <p className="empty-state-description">
              Click the button above to add a new customer
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th className="text-right">Actions</th>
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
                      <div className="customer-name">
                        <div className="avatar">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="customer-name-text">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      {customer.phone ? (
                        <div className="customer-phone">
                          <Phone />
                          <span>{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-tertiary">--</span>
                      )}
                    </td>
                    <td>
                      {customer.email ? (
                        <div className="customer-email">
                          <Mail />
                          <span className="truncate max-w-200">
                            {customer.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-tertiary">--</span>
                      )}
                    </td>
                    <td>
                      <div className="customer-actions">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="action-btn view"
                          title="View"
                        >
                          <Eye />
                        </Link>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="action-btn edit"
                          title="Edit"
                        >
                          <Pencil />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          disabled={deletingId === customer.id}
                          className="action-btn delete"
                          title="Delete"
                        >
                          {deletingId === customer.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 />
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
                  <div className="modal-icon indigo">
                    <Sparkles />
                  </div>
                  <h2 className="text-lg font-semibold text-primary">
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="action-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="modal-body space-y-4">
                <div>
                  <label className="form-label">
                    Name *
                  </label>
                  <input
                    {...register("name")}
                    className="input-premium"
                    placeholder="Customer name"
                  />
                  {errors.name && (
                    <p className="text-xs text-error mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      Phone
                    </label>
                    <input
                      {...register("phone")}
                      className="input-premium"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      Email
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="input-premium"
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-error mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Address
                  </label>
                  <input
                    {...register("address")}
                    className="input-premium"
                    placeholder="Address (optional)"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Notes
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    className="input-premium resize-none"
                    placeholder="Additional notes (optional)"
                  />
                </div>

                <div className="modal-footer !border-t-0 !p-0 !mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingCustomer ? "Update" : "Save"}
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
