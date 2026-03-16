"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { mutate } from "swr";
import {
  Plus,
  X,
  Loader2,
  CreditCard,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PAYMENT_METHODS } from "@/lib/constants";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { PaymentWithRelations, AssignmentWithRelations } from "@/types";

export default function PaymentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal form state
  const [assignmentId, setAssignmentId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<"cash" | "bkash" | "nagad" | "bank" | "other">("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  const { data: payments, error, isLoading } = useSWR<PaymentWithRelations[]>(
    "/api/payments",
    fetcher
  );
  const { data: activeAssignments } = useSWR<AssignmentWithRelations[]>(
    "/api/assignments?status=active",
    fetcher
  );

  // Summary calculations
  const totalPayments = useMemo(() => {
    if (!payments) return 0;
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const todayPayments = useMemo(() => {
    if (!payments) return 0;
    const today = new Date().toISOString().split("T")[0];
    return payments
      .filter((p) => p.paymentDate.startsWith(today))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  function getMethodLabel(methodValue: string) {
    const found = PAYMENT_METHODS.find((m) => m.value === methodValue);
    return found?.label || methodValue;
  }

  function openModal() {
    setAssignmentId("");
    setAmount(0);
    setMethod("cash");
    setPaymentNotes("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();

    if (!assignmentId) {
      toast.error("Please select an assignment");
      return;
    }
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createPayment({
        assignmentId,
        amount,
        method,
        notes: paymentNotes,
      });

      toast.success("Payment added successfully");
      mutate("/api/payments");
      mutate("/api/assignments?status=active");
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell>
      <PageHeader title="Payment Management" subtitle="View and manage all payments">
        <button
          onClick={openModal}
          className="btn btn-primary"
        >
          <Plus />
          New Payment
        </button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="stat-icon">
              <Wallet />
            </div>
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">
              Total Payments
            </span>
          </div>
          <p className="amount-text text-xl text-primary">
            {isLoading ? "..." : formatCurrency(totalPayments)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="stat-icon success">
              <TrendingUp />
            </div>
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">
              Today's Payments
            </span>
          </div>
          <p className="amount-text text-xl text-primary">
            {isLoading ? "..." : formatCurrency(todayPayments)}
          </p>
        </motion.div>
      </div>

      {/* Error */}
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
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-line-md" />
                  <div className="skeleton-line-lg" />
                  <div className="skeleton-line-md" />
                  <div className="skeleton-line-sm" />
                  <div className="skeleton-line-sm" />
                </div>
              ))}
            </div>
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="empty-state-small">
            <CreditCard />
            <p>No payments found</p>
            <span>Click the button above to add a new payment</span>
          </div>
        ) : (
          <div className="table-overflow">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, i) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="text-secondary">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td>
                      <span className="font-medium text-primary">
                        {payment.assignment.customer.name}
                      </span>
                    </td>
                    <td className="text-primary">
                      {payment.assignment.service.name}
                    </td>
                    <td>
                      <span className="amount-text text-success">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="category-badge">
                        {getMethodLabel(payment.method)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
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
                  Add New Payment
                </h2>
                <button
                  onClick={closeModal}
                  className="action-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                {/* Assignment Select */}
                <div className="form-group">
                  <label className="form-label">
                    Assignment (Customer - Service) *
                  </label>
                  <select
                    value={assignmentId}
                    onChange={(e) => {
                      setAssignmentId(e.target.value);
                      const selected = activeAssignments?.find(
                        (a) => a.id === e.target.value
                      );
                      if (selected) {
                        setAmount(selected.customPrice);
                      }
                    }}
                    className="form-select"
                  >
                    <option value="">-- Select an assignment --</option>
                    {(activeAssignments || []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.customer.name} - {a.service.name} ({formatCurrency(a.customPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount & Method */}
                <div className="form-row">
                  <div>
                    <label className="form-label">
                      Amount *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      Method
                    </label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value as typeof method)}
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

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">
                    Notes
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={2}
                    className="form-textarea"
                    placeholder="Additional information (optional)"
                  />
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
                    Add Payment
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
