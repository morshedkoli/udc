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
  PackageOpen,
  AlertCircle,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { serviceSchema, type ServiceInput } from "@/lib/validators";
import { formatCurrency } from "@/lib/formatters";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api-client";
import type { Service } from "@/types";

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", description: "", defaultPrice: 0, category: "General", status: "active" },
  });

  const statusValue = watch("status");

  function openAddModal() {
    setEditingService(null);
    reset({ name: "", description: "", defaultPrice: 0, category: "General", status: "active" });
    setShowModal(true);
  }

  function openEditModal(service: Service) {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description || "",
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
      <div className="search-box">
        <div className="search-box-inner">
          <Search className="search-box-icon" />
          <input
            type="text"
            placeholder="Search services..."
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
                  <div className="skeleton-line-sm" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <PackageOpen />
            </div>
            <p className="empty-state-title">No services found</p>
            <p className="empty-state-description">
              Click the button above to add a new service
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
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
                      <span className="amount-text">
                        {formatCurrency(service.defaultPrice)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          service.status === "active"
                            ? "badge-success"
                            : "badge-default"
                        }`}
                      >
                        {service.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => openEditModal(service)}
                          className="table-action-btn table-action-edit"
                          title="Edit"
                        >
                          <Pencil />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          disabled={deletingId === service.id}
                          className="table-action-btn table-action-delete"
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
                <h2 className="modal-title">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
                <button
                  onClick={closeModal}
                  className="modal-close"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Service Name *
                  </label>
                  <input
                    {...register("name")}
                    className="input-premium"
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
                    className="input-premium resize-none"
                    placeholder="Service description (optional)"
                  />
                </div>

                <div className="form-row">
                  <div>
                    <label className="form-label">
                      Default Price *
                    </label>
                    <input
                      {...register("defaultPrice", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="any"
                      className="input-premium"
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
                      className="input-premium"
                    >
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={statusValue === "active"}
                      onChange={(e) => setValue("status", e.target.checked ? "active" : "inactive", { shouldValidate: true })}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-secondary">
                      Active Service
                    </span>
                  </label>
                </div>

                <div className="modal-footer">
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
                    {isSubmitting && <Loader2 className="animate-spin" />}
                    {editingService ? "Update" : "Save"}
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
