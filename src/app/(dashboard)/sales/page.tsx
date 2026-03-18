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
  Minus,
  Package,
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
      (s.customerName?.toLowerCase() || "").includes(q) ||
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
      quantity: 1,
      saleDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const serviceIdValue = watch("serviceId");
  const quantityValue = watch("quantity");

  // Auto-fill price when service or quantity changes
  const selectedService = services?.find((s) => s.id === serviceIdValue);
  if (selectedService && serviceIdValue) {
    const calculatedPrice = selectedService.defaultPrice * (quantityValue || 1);
    const currentPrice = watch("price");
    // Only auto-update if price matches the previous calculation or is 0
    if (currentPrice === 0 || currentPrice === undefined || 
        currentPrice === selectedService.defaultPrice * ((quantityValue || 1) - 1)) {
      setValue("price", calculatedPrice);
    }
  }

  function openAddModal() {
    setEditingSale(null);
    reset({
      serviceId: "",
      customerName: "",
      customerGender: "male",
      price: 0,
      quantity: 1,
      saleDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowModal(true);
  }

  function openEditModal(sale: Sale) {
    setEditingSale(sale);
    reset({
      serviceId: sale.serviceId,
      customerName: sale.customerName || "",
      customerGender: sale.customerGender as "male" | "female" | "other",
      price: sale.price,
      quantity: sale.quantity || 1,
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
                  <th>Qty</th>
                  <th>Total</th>
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sale.customerName ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className={`font-medium ${sale.customerName ? 'text-primary' : 'text-secondary'}`}>
                          {sale.customerName || "Anonymous"}
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
                      <span className="badge badge-default">
                        ×{sale.quantity || 1}
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

      {/* Premium Sale Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sale-modal-overlay"
          >
            <motion.div
              className="sale-modal-backdrop"
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="sale-modal-container"
            >
              {/* Premium Header */}
              <div className="sale-modal-header">
                <div className="sale-modal-header-content">
                  <div className="sale-modal-icon">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="sale-modal-title">
                      {editingSale ? "Edit Sale Record" : "Record New Sale"}
                    </h2>
                    <p className="sale-modal-subtitle">
                      {editingSale ? "Update the sale details below" : "Fill in the details to record a new sale"}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="sale-modal-close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="sale-modal-body">
                {/* Customer Section */}
                <div className="sale-form-section">
                  <div className="sale-section-header">
                    <User className="w-4 h-4" />
                    <span>Customer Information</span>
                  </div>

                  <div className="sale-form-grid">
                    {/* Customer Name */}
                    <div className="sale-form-field sale-form-field-full">
                      <label className="sale-form-label">Customer Name</label>
                      <div className="sale-input-wrapper">
                        <input
                          {...register("customerName")}
                          className="sale-input"
                          placeholder="Enter customer name (optional)"
                        />
                        <div className="sale-input-hint">Leave empty for anonymous</div>
                      </div>
                      {errors.customerName && (
                        <p className="sale-form-error">{errors.customerName.message}</p>
                      )}
                    </div>

                    {/* Gender Selection - Premium Toggle */}
                    <div className="sale-form-field">
                      <label className="sale-form-label">Gender</label>
                      <div className="sale-gender-selector">
                        {[
                          { value: "male", label: "Male" },
                          { value: "female", label: "Female" },
                          { value: "other", label: "Other" },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`sale-gender-option ${watch("customerGender") === option.value ? "active" : ""}`}
                          >
                            <input
                              type="radio"
                              {...register("customerGender")}
                              value={option.value}
                              className="sr-only"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sale Date */}
                    <div className="sale-form-field">
                      <label className="sale-form-label">
                        <Calendar className="w-3.5 h-3.5" />
                        Sale Date
                      </label>
                      <input
                        type="date"
                        {...register("saleDate")}
                        className="sale-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Section */}
                <div className="sale-form-section">
                  <div className="sale-section-header">
                    <Package className="w-4 h-4" />
                    <span>Service Details</span>
                  </div>

                  {/* Service Selection */}
                  <div className="sale-form-field">
                    <label className="sale-form-label">Select Service</label>
                    <div className="sale-service-grid">
                      {(services || []).slice(0, 6).map((s) => (
                        <label
                          key={s.id}
                          className={`sale-service-card ${serviceIdValue === s.id ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            {...register("serviceId")}
                            value={s.id}
                            className="sr-only"
                          />
                          <span className="sale-service-name">{s.name}</span>
                          <span className="sale-service-price">{formatCurrency(s.defaultPrice)}</span>
                        </label>
                      ))}
                    </div>
                    {(services || []).length > 6 && (
                      <select
                        {...register("serviceId")}
                        className="sale-input mt-3"
                      >
                        <option value="">More services...</option>
                        {(services || []).slice(6).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} - {formatCurrency(s.defaultPrice)}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.serviceId && (
                      <p className="sale-form-error">{errors.serviceId.message}</p>
                    )}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="sale-form-section">
                  <div className="sale-section-header">
                    <DollarSign className="w-4 h-4" />
                    <span>Pricing</span>
                  </div>

                  <div className="sale-pricing-row">
                    {/* Quantity Stepper */}
                    <div className="sale-form-field">
                      <label className="sale-form-label">Quantity</label>
                      <div className="sale-quantity-stepper">
                        <button
                          type="button"
                          onClick={() => {
                            const current = watch("quantity") || 1;
                            if (current > 1) setValue("quantity", current - 1);
                          }}
                          className="sale-qty-btn"
                          disabled={quantityValue <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          {...register("quantity", { valueAsNumber: true })}
                          className="sale-qty-input"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = watch("quantity") || 1;
                            setValue("quantity", current + 1);
                          }}
                          className="sale-qty-btn"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="sale-form-field sale-form-field-grow">
                      <label className="sale-form-label">Total Amount</label>
                      <div className="sale-price-input-wrapper">
                        <span className="sale-price-currency">৳</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          {...register("price", { valueAsNumber: true })}
                          className="sale-price-input"
                          placeholder="0"
                        />
                      </div>
                      {errors.price && (
                        <p className="sale-form-error">{errors.price.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Price Summary */}
                  {selectedService && (
                    <motion.div
                      className="sale-price-summary"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <div className="sale-price-row">
                        <span>Unit Price</span>
                        <span>{formatCurrency(selectedService.defaultPrice)}</span>
                      </div>
                      <div className="sale-price-row">
                        <span>Quantity</span>
                        <span>× {quantityValue || 1}</span>
                      </div>
                      <div className="sale-price-row sale-price-total">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedService.defaultPrice * (quantityValue || 1))}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Notes Section */}
                <div className="sale-form-section sale-form-section-flat">
                  <div className="sale-form-field">
                    <label className="sale-form-label sale-form-label-optional">
                      Notes
                      <span className="sale-optional-tag">Optional</span>
                    </label>
                    <textarea
                      {...register("notes")}
                      rows={2}
                      className="sale-input sale-textarea"
                      placeholder="Add any additional notes about this sale..."
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="sale-modal-footer">
                  <button type="button" onClick={closeModal} className="sale-btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="sale-btn-submit">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4" />
                        <span>{editingSale ? "Update Sale" : "Record Sale"}</span>
                      </>
                    )}
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
