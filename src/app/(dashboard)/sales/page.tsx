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
  Receipt,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { saleSchema, type SaleInput } from "@/lib/validators";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { fetcher } from "@/lib/fetcher";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import type { Sale, Service } from "@/types";

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data: services } = useSWR<Service[]>("/api/services?status=active", fetcher);
  const { data: sales, error, isLoading } = useSWR<Sale[]>("/api/sales", fetcher);

  const filteredSales = (sales || []).filter((s) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(q) ||
      s.service?.name.toLowerCase().includes(q)
    );
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      serviceId: "",
      customerName: "",
      customerGender: "male",
      price: 0,
      saleDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const serviceIdValue = watch("serviceId");

  // Auto-fill price when service changes
  const selectedService = services?.find((s) => s.id === serviceIdValue);
  if (selectedService && serviceIdValue) {
    const currentPrice = watch("price");
    if (currentPrice === 0 || currentPrice === undefined) {
      setValue("price", selectedService.defaultPrice);
    }
  }

  function openAddModal() {
    setEditingSale(null);
    reset({
      serviceId: "",
      customerName: "",
      customerGender: "male",
      price: 0,
      saleDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowModal(true);
  }

  function openEditModal(sale: Sale) {
    setEditingSale(sale);
    reset({
      serviceId: sale.serviceId,
      customerName: sale.customerName,
      customerGender: sale.customerGender as "male" | "female" | "other",
      price: sale.price,
      saleDate: new Date(sale.saleDate).toISOString().split("T")[0],
      notes: sale.notes || "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingSale(null);
    reset();
  }

  async function onSubmit(formData: SaleInput) {
    setIsSubmitting(true);
    try {
      if (editingSale) {
        await api.updateSale(editingSale.id, formData);
        toast.success("Sale updated successfully");
      } else {
        await api.createSale(formData);
        toast.success("Sale recorded successfully");
      }
      mutate("/api/sales");
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(sale: Sale) {
    if (!confirm("Are you sure you want to delete this sale record?")) return;
    setDeletingId(sale.id);
    try {
      await api.deleteSale(sale.id);
      toast.success("Sale deleted successfully");
      mutate("/api/sales");
    } catch {
      toast.error("Failed to delete sale");
    } finally {
      setDeletingId(null);
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "other":
        return "Other";
      default:
        return gender;
    }
  };

  return (
    <PageShell>
      <PageHeader title="Sales Records" subtitle="Record and manage all service sales">
        <button onClick={openAddModal} className="btn-primary">
          <Plus />
          New Sale
        </button>
      </PageHeader>

      {/* Search */}
      <div className="search-box">
        <div className="search-box-inner">
          <Search className="search-box-icon" />
          <input
            type="text"
            placeholder="Search by customer name or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box-input"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle />
          <span>Failed to load data. Please try again.</span>
        </div>
      )}

      {/* Table */}
      <div className="dashboard-card">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-line-lg" />
                  <div className="skeleton-line-md" />
                  <div className="skeleton-line-sm" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Receipt />
            </div>
            <p className="empty-state-title">No sales found</p>
            <p className="empty-state-description">
              Click the button above to record a new sale
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Gender</th>
                  <th>Service</th>
                  <th>Price</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale, i) => (
                  <motion.tr
                    key={sale.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="text-secondary">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-primary">
                          {sale.customerName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-default">
                        {getGenderLabel(sale.customerGender)}
                      </span>
                    </td>
                    <td>
                      <span className="text-primary">
                        {sale.service?.name || "Unknown Service"}
                      </span>
                    </td>
                    <td>
                      <span className="amount-text font-semibold">
                        {formatCurrency(sale.price)}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => openEditModal(sale)}
                          className="table-action-btn table-action-edit"
                          title="Edit"
                        >
                          <Pencil />
                        </button>
                        <button
                          onClick={() => handleDelete(sale)}
                          disabled={deletingId === sale.id}
                          className="table-action-btn table-action-delete"
                          title="Delete"
                        >
                          {deletingId === sale.id ? (
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
            <div className="modal-backdrop" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-content"
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingSale ? "Edit Sale" : "Record New Sale"}
                </h2>
                <button onClick={closeModal} className="modal-close">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="modal-body">
                {/* Customer Name */}
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                    <input
                      {...register("customerName")}
                      className="input-premium pl-10"
                      placeholder="Enter customer name"
                    />
                  </div>
                  {errors.customerName && (
                    <p className="form-error">{errors.customerName.message}</p>
                  )}
                </div>

                {/* Gender & Date */}
                <div className="form-row">
                  <div>
                    <label className="form-label">Gender *</label>
                    <select
                      {...register("customerGender")}
                      className="input-premium"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                      <input
                        type="date"
                        {...register("saleDate")}
                        className="input-premium pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Service & Price */}
                <div className="form-row">
                  <div>
                    <label className="form-label">Service *</label>
                    <select
                      {...register("serviceId")}
                      className="input-premium"
                    >
                      <option value="">Select a service</option>
                      {(services || []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} - {formatCurrency(s.defaultPrice)}
                        </option>
                      ))}
                    </select>
                    {errors.serviceId && (
                      <p className="form-error">{errors.serviceId.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Price *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                      <input
                        type="number"
                        min="0"
                        step="any"
                        {...register("price", { valueAsNumber: true })}
                        className="input-premium pl-10"
                        placeholder="0"
                      />
                    </div>
                    {errors.price && (
                      <p className="form-error">{errors.price.message}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    className="input-premium resize-none"
                    placeholder="Additional notes (optional)"
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting && <Loader2 className="animate-spin" />}
                    {editingSale ? "Update" : "Save"}
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
