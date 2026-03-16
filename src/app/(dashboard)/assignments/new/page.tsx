"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  CreditCard,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency } from "@/lib/formatters";
import { PAYMENT_METHODS } from "@/lib/constants";
import { fetcher } from "@/lib/fetcher";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import type { Customer, Service } from "@/types";

export default function NewAssignmentPage() {
  const router = useRouter();

  const { data: customers, isLoading: loadingCustomers } = useSWR<Customer[]>(
    "/api/customers",
    fetcher
  );
  const { data: services, isLoading: loadingServices } = useSWR<Service[]>(
    "/api/services?status=active",
    fetcher
  );

  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [assignedDate, setAssignedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");

  // Payment fields
  const [addPayment, setAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill price when service changes
  useEffect(() => {
    if (serviceId && services) {
      const selected = services.find((s) => s.id === serviceId);
      if (selected) {
        setCustomPrice(selected.defaultPrice);
        setPaymentAmount(selected.defaultPrice);
      }
    }
  }, [serviceId, services]);

  // Sync payment amount when price changes (only if payment amount equals old price)
  useEffect(() => {
    if (addPayment) {
      setPaymentAmount(customPrice);
    }
  }, [customPrice, addPayment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!serviceId) {
      toast.error("Please select a service");
      return;
    }
    if (customPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create assignment
      const newAssignment = await api.createAssignment({
        customerId,
        serviceId,
        customPrice,
        assignedDate,
        notes,
        status: "active",
      });

      // Step 2: Create payment if checked
      if (addPayment && paymentAmount > 0) {
        try {
          await api.createPayment({
            assignmentId: newAssignment.id,
            amount: paymentAmount,
            method: paymentMethod as "cash" | "bkash" | "nagad" | "bank" | "other",
            notes: "",
          });
        } catch {
          // Assignment created but payment failed
          toast.warning("Assignment created, but payment could not be added");
          router.push("/assignments");
          return;
        }
      }

      toast.success("Assignment created successfully!");
      router.push("/assignments");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedService = services?.find((s) => s.id === serviceId);
  const isDataLoading = loadingCustomers || loadingServices;

  return (
    <PageShell>
      {/* Back link */}
      <Link
        href="/assignments"
        className="back-link"
      >
        <ArrowLeft />
        Assignments
      </Link>

      <PageHeader title="New Assignment" subtitle="Create a new service assignment for a customer" />

      {isDataLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <span className="ml-3 text-sm text-secondary">Loading data...</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="settings-card"
          style={{ maxWidth: '672px' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Select */}
            <div className="form-group">
              <label className="form-label">
                Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="form-select"
              >
                <option value="">-- Select a customer --</option>
                {(customers || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Select */}
            <div className="form-group">
              <label className="form-label">
                Service *
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="form-select"
              >
                <option value="">-- Select a service --</option>
                {(services || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category}) - {formatCurrency(s.defaultPrice)}
                  </option>
                ))}
              </select>
              {selectedService && (
                <p className="text-xs text-tertiary mt-1">
                  Default price: {formatCurrency(selectedService.defaultPrice)}
                </p>
              )}
            </div>

            {/* Price & Date */}
            <div className="form-row">
              <div>
                <label className="form-label">
                  Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  className="form-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="form-label">
                  Date
                </label>
                <input
                  type="date"
                  value={assignedDate}
                  onChange={(e) => setAssignedDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="form-textarea"
                placeholder="Additional information (optional)"
              />
            </div>

            {/* Payment Toggle */}
            <div className="border-t border-subtle pt-5">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={addPayment}
                  onChange={(e) => setAddPayment(e.target.checked)}
                  className="form-checkbox"
                />
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-tertiary" />
                  <span className="text-sm font-medium text-primary">
                    Add payment now
                  </span>
                </div>
              </label>
            </div>

            {/* Payment Fields */}
            {addPayment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-muted rounded-lg p-4 space-y-4"
              >
                <div className="form-row">
                  <div>
                    <label className="form-label">
                      Payment Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-select"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit */}
            <div className="form-actions">
              <Link
                href="/assignments"
                className="btn btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save />
                )}
                Create Assignment
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </PageShell>
  );
}
