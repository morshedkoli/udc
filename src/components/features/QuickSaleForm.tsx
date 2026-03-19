"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useSWR, { mutate } from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Receipt,
  Loader2,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { saleSchema, type SaleInput } from "@/lib/validators";
import { formatCurrency } from "@/lib/formatters";
import { fetcher } from "@/lib/fetcher";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import type { Service } from "@/types";

export function QuickSaleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: services } = useSWR<Service[]>("/api/services?status=active", fetcher);

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
  const selectedService = services?.find((s) => s.id === serviceIdValue);

  // Auto-fill price when service or quantity changes
  useEffect(() => {
    if (selectedService) {
      setValue("price", selectedService.defaultPrice * (quantityValue || 1));
    }
  }, [serviceIdValue, quantityValue, selectedService, setValue]);

  async function onSubmit(formData: SaleInput) {
    setIsSubmitting(true);
    try {
      await api.createSale(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      toast.success("Sale recorded successfully!");
      mutate("/api/sales");
      mutate("/api/dashboard");
      reset({
        serviceId: "",
        customerName: "",
        customerGender: "male",
        price: 0,
        quantity: 1,
        saleDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record sale");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="dashboard-card quick-sale-card-inline"
    >
      <div className="quick-sale-decor" />

      {/* Header */}
      <div className="quick-sale-header-inline">
        <div className="quick-sale-icon">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <h3 className="quick-sale-title">Quick Sale</h3>
          <p className="quick-sale-subtitle">Record a sale instantly</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="quick-sale-form-inline">
        {/* Service Selection */}
        <div className="quick-sale-field">
          <label className="quick-sale-label">Service</label>
          <select
            {...register("serviceId")}
            className="quick-sale-select"
          >
            <option value="">Select a service...</option>
            {(services || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {formatCurrency(s.defaultPrice)}
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <p className="quick-sale-error">{errors.serviceId.message}</p>
          )}
        </div>

        {/* Customer Name */}
        <div className="quick-sale-field">
          <label className="quick-sale-label">
            Customer <span className="text-[var(--text-tertiary)]">(optional)</span>
          </label>
          <input
            {...register("customerName")}
            className="quick-sale-input"
            placeholder="Customer name"
          />
        </div>

        {/* Gender Selection */}
        <div className="quick-sale-field">
          <label className="quick-sale-label">Gender</label>
          <div className="quick-sale-gender">
            {[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ].map((option) => (
              <label
                key={option.value}
                className={`quick-sale-gender-btn ${
                  watch("customerGender") === option.value ? "active" : ""
                }`}
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

        {/* Quantity & Price Row */}
        <div className="quick-sale-row">
          {/* Quantity */}
          <div className="quick-sale-field quick-sale-field-qty">
            <label className="quick-sale-label">Qty</label>
            <div className="quick-sale-qty">
              <button
                type="button"
                onClick={() => {
                  const current = watch("quantity") || 1;
                  if (current > 1) setValue("quantity", current - 1);
                }}
                className="quick-sale-qty-btn"
                disabled={quantityValue <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                {...register("quantity", { valueAsNumber: true })}
                className="quick-sale-qty-input"
              />
              <button
                type="button"
                onClick={() => {
                  const current = watch("quantity") || 1;
                  setValue("quantity", current + 1);
                }}
                className="quick-sale-qty-btn"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="quick-sale-field quick-sale-field-price">
            <label className="quick-sale-label">Total</label>
            <div className="quick-sale-price-wrap">
              <span className="quick-sale-currency">৳</span>
              <input
                type="number"
                min="0"
                step="any"
                {...register("price", { valueAsNumber: true })}
                className="quick-sale-price-input"
                placeholder="0"
              />
            </div>
            {errors.price && (
              <p className="quick-sale-error">{errors.price.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || showSuccess}
          className={`quick-sale-submit ${showSuccess ? "success" : ""}`}
        >
          {showSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Recorded!</span>
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Recording...</span>
            </>
          ) : (
            <>
              <Receipt className="w-4 h-4" />
              <span>Record Sale</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
