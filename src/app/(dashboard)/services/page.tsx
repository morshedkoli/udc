"use client";

import { useState, useEffect } from "react";
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
  PackageOpen,
  ClipboardCheck,
  CreditCard,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { serviceSchema, type ServiceInput } from "@/lib/validators";
import { formatCurrency } from "@/lib/formatters";
import { SERVICE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api-client";
import type { Service, Customer } from "@/types";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Record service state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordingService, setRecordingService] = useState<Service | null>(null);
  const [recordCustomerName, setRecordCustomerName] = useState("");
  const [recordCustomerPhone, setRecordCustomerPhone] = useState("");
  const [recordCustomerSearch, setRecordCustomerSearch] = useState("");
  const [recordPrice, setRecordPrice] = useState(0);
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [recordNotes, setRecordNotes] = useState("");
  const [recordAddPayment, setRecordAddPayment] = useState(false);
  const [recordPaymentAmount, setRecordPaymentAmount] = useState(0);
  const [recordPaymentMethod, setRecordPaymentMethod] = useState("cash");
  const [isRecording, setIsRecording] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedCustomerSearch = useDebounce(recordCustomerSearch, 300);

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
    defaultValues: { name: "", description: "", defaultPrice: 0, category: "General", status: "active" },
  });

  function openAddModal() {
    setEditingService(null);
    reset({ name: "", description: "", defaultPrice: 0, category: "General", status: "active" });
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
      if (editingService) {
        await api.updateService(editingService.id, formData);
        toast.success("Service updated successfully");
      } else {
        await api.createService(formData);
        toast.success("Service added successfully");
      }
      mutate(apiUrl);
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return;
    setDeletingId(service.id);
    try {
      await api.deleteService(service.id);
      toast.success("Service deleted successfully");
      mutate(apiUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  }

  function openRecordModal(service: Service) {
    setRecordingService(service);
    setRecordCustomerName("");
    setRecordCustomerPhone("");
    setRecordCustomerSearch("");
    setRecordPrice(service.defaultPrice);
    setRecordDate(new Date().toISOString().split("T")[0]);
    setRecordNotes("");
    setRecordAddPayment(false);
    setRecordPaymentAmount(service.defaultPrice);
    setRecordPaymentMethod("cash");
    setCustomerSuggestions([]);
    setShowSuggestions(false);
    setShowRecordModal(true);
  }

  function closeRecordModal() {
    setShowRecordModal(false);
    setRecordingService(null);
  }

  // Fetch customer suggestions when typing
  useEffect(() => {
    if (!debouncedCustomerSearch || debouncedCustomerSearch.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    api.getCustomers(debouncedCustomerSearch).then((customers) => {
      setCustomerSuggestions(customers.slice(0, 5));
    }).catch(() => {});
  }, [debouncedCustomerSearch]);

  async function handleRecordService(e: React.FormEvent) {
    e.preventDefault();
    if (!recordingService) return;
    const name = recordCustomerName.trim();
    if (!name) {
      toast.error("Please enter a customer name");
      return;
    }
    if (recordPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsRecording(true);
    try {
      // Find or create customer
      let customerId: string;
      const existing = await api.getCustomers(name);
      const match = existing.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() ||
               (recordCustomerPhone && c.phone === recordCustomerPhone)
      );
      if (match) {
        customerId = match.id;
      } else {
        const newCustomer = await api.createCustomer({
          name,
          phone: recordCustomerPhone,
          email: "",
          address: "",
          notes: "",
        });
        customerId = newCustomer.id;
      }

      // Create assignment as completed
      const newAssignment = await api.createAssignment({
        customerId,
        serviceId: recordingService.id,
        customPrice: recordPrice,
        assignedDate: recordDate,
        status: "completed",
        notes: recordNotes,
      });

      // Optionally record payment
      if (recordAddPayment && recordPaymentAmount > 0) {
        await api.createPayment({
          assignmentId: newAssignment.id,
          amount: recordPaymentAmount,
          method: recordPaymentMethod as "cash" | "bkash" | "nagad" | "bank" | "other",
          notes: "",
        });
      }

      toast.success("Service recorded successfully");
      closeRecordModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record service");
    } finally {
      setIsRecording(false);
    }
  }

  return (
    <PageShell>
      <PageHeader title="Service Catalog" subtitle="Manage and view all services">
        <button
          onClick={openAddModal}
          className="btn btn-primary"
        >
          <Plus />
          New Service
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="filters-row">
        <div className="filter-search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input search-input-with-icon"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert-error">
          Failed to load data. Please try again.
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-line-lg" />
                  <div className="skeleton-line-md" />
                  <div className="skeleton-line-sm" />
                  <div className="skeleton-line-sm" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-state-small">
            <PackageOpen />
            <p>No services found</p>
            <span>Click the button above to add a new service</span>
          </div>
        ) : (
          <div className="table-overflow">
            <table className="table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="table-header-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, i) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div>
                        <p className="service-name">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="service-description">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {service.category}
                      </span>
                    </td>
                    <td>
                      <span className="service-price">
                        {formatCurrency(service.defaultPrice)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          service.status === "active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {service.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="customer-actions">
                        <button
                          onClick={() => openRecordModal(service)}
                          className="action-btn"
                          title="Record Service"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          <ClipboardCheck />
                        </button>
                        <button
                          onClick={() => openEditModal(service)}
                          className="action-btn edit"
                          title="Edit"
                        >
                          <Pencil />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          disabled={deletingId === service.id}
                          className="action-btn delete"
                          title="Delete"
                        >
                          {deletingId === service.id ? (
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
            className="modal-overlay-full"
          >
            <div
              className="modal-backdrop-full"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-content-full"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-primary">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
                <button
                  onClick={closeModal}
                  className="action-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Service Name
                  </label>
                  <input
                    {...register("name")}
                    className="form-input"
                    placeholder="Enter service name"
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    className="form-textarea"
                    placeholder="Service description (optional)"
                  />
                </div>

                <div className="form-row">
                  <div>
                    <label className="form-label form-label-required">
                      Default Price
                    </label>
                    <input
                      {...register("defaultPrice", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="any"
                      className="form-input"
                      placeholder="0"
                    />
                    {errors.defaultPrice && (
                      <p className="form-error">
                        {errors.defaultPrice.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      Category
                    </label>
                    <select
                      {...register("category")}
                      className="form-select"
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
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      {...register("status", {
                        setValueAs: (v: boolean) => (v ? "active" : "inactive"),
                      })}
                      defaultChecked={
                        editingService ? editingService.status === "active" : true
                      }
                      className="form-checkbox"
                    />
                    <span className="text-sm text-secondary">
                      Active Service
                    </span>
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting && <Loader2 className="animate-spin" />}
                    {editingService ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Record Service Modal */}
      <AnimatePresence>
        {showRecordModal && recordingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay-full"
          >
            <div className="modal-backdrop-full" onClick={closeRecordModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-content-full"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-[var(--brand-primary)]" />
                    Record Service
                  </h2>
                  <p className="text-sm text-secondary mt-0.5">{recordingService.name}</p>
                </div>
                <button onClick={closeRecordModal} className="action-btn">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordService} className="space-y-4">
                {/* Customer name with autocomplete */}
                <div className="form-group relative">
                  <label className="form-label form-label-required">Customer Name</label>
                  <input
                    value={recordCustomerName}
                    onChange={(e) => {
                      setRecordCustomerName(e.target.value);
                      setRecordCustomerSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onFocus={() => recordCustomerSearch.length >= 2 && setShowSuggestions(true)}
                    className="form-input"
                    placeholder="Type customer name..."
                    autoComplete="off"
                  />
                  {showSuggestions && customerSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-lg overflow-hidden">
                      {customerSuggestions.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-surface-hover)] text-primary transition-colors"
                          onMouseDown={() => {
                            setRecordCustomerName(c.name);
                            setRecordCustomerPhone(c.phone || "");
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="font-medium">{c.name}</span>
                          {c.phone && <span className="text-secondary ml-2">{c.phone}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone (optional)</label>
                  <input
                    value={recordCustomerPhone}
                    onChange={(e) => setRecordCustomerPhone(e.target.value)}
                    className="form-input"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div className="form-row">
                  <div>
                    <label className="form-label form-label-required">Price</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={recordPrice}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setRecordPrice(v);
                        if (recordAddPayment) setRecordPaymentAmount(v);
                      }}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={recordNotes}
                    onChange={(e) => setRecordNotes(e.target.value)}
                    rows={2}
                    className="form-textarea"
                    placeholder="Additional notes (optional)"
                  />
                </div>

                {/* Payment */}
                <div className="border-t border-subtle pt-4">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={recordAddPayment}
                      onChange={(e) => {
                        setRecordAddPayment(e.target.checked);
                        if (e.target.checked) setRecordPaymentAmount(recordPrice);
                      }}
                      className="form-checkbox"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-tertiary" />
                      <span className="text-sm font-medium text-primary">Record payment now</span>
                    </div>
                  </label>
                </div>

                {recordAddPayment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-muted rounded-lg p-4 space-y-4"
                  >
                    <div className="form-row">
                      <div>
                        <label className="form-label">Amount</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={recordPaymentAmount}
                          onChange={(e) => setRecordPaymentAmount(parseFloat(e.target.value) || 0)}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Method</label>
                        <select
                          value={recordPaymentMethod}
                          onChange={(e) => setRecordPaymentMethod(e.target.value)}
                          className="form-select"
                        >
                          {PAYMENT_METHODS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="form-actions">
                  <button type="button" onClick={closeRecordModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={isRecording} className="btn btn-primary">
                    {isRecording && <Loader2 className="animate-spin" />}
                    Record Service
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
