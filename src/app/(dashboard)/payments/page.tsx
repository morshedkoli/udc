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
import { formatCurrency, formatBanglaDate } from "@/lib/formatters";
import { PAYMENT_METHODS } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  method: string;
  notes: string;
  assignment: {
    id: string;
    customPrice: number;
    customer: {
      id: string;
      name: string;
    };
    service: {
      id: string;
      name: string;
    };
  };
}

interface Assignment {
  id: string;
  customPrice: number;
  status: string;
  customer: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
  };
}

export default function PaymentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal form state
  const [assignmentId, setAssignmentId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  const { data: payments, error, isLoading } = useSWR<Payment[]>(
    "/api/payments",
    fetcher
  );
  const { data: activeAssignments } = useSWR<Assignment[]>(
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
      toast.error("বরাদ্দ নির্বাচন করুন");
      return;
    }
    if (amount <= 0) {
      toast.error("পরিমাণ সঠিকভাবে লিখুন");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          amount,
          method,
          notes: paymentNotes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "পেমেন্ট তৈরি ব্যর্থ");
      }

      toast.success("পেমেন্ট সফলভাবে যোগ হয়েছে");
      mutate("/api/payments");
      mutate("/api/assignments?status=active");
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "কিছু সমস্যা হয়েছে";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell>
      <PageHeader title="পেমেন্ট" subtitle="সকল পেমেন্টের তালিকা ও ব্যবস্থাপনা">
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          নতুন পেমেন্ট
        </button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              মোট পেমেন্ট
            </span>
          </div>
          <p className="amount-text text-xl text-[var(--text-primary)]">
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
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              আজকের পেমেন্ট
            </span>
          </div>
          <p className="amount-text text-xl text-[var(--text-primary)]">
            {isLoading ? "..." : formatCurrency(todayPayments)}
          </p>
        </motion.div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[var(--color-error-light)] border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ডাটা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="h-4 w-28 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-32 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-28 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-20 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-16 bg-[var(--bg-muted)] rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              কোনো পেমেন্ট পাওয়া যায়নি
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              নতুন পেমেন্ট যোগ করতে উপরের বাটনে ক্লিক করুন
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-muted)]">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    তারিখ
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    গ্রাহক
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    সেবা
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    পরিমাণ
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    পদ্ধতি
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, i) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {formatBanglaDate(payment.paymentDate)}
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <span className="font-medium text-[var(--text-primary)]">
                        {payment.assignment.customer.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-primary)]">
                      {payment.assignment.service.name}
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <span className="amount-text text-emerald-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)]">
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
                  নতুন পেমেন্ট যোগ করুন
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-tertiary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                {/* Assignment Select */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    বরাদ্দ (গ্রাহক - সেবা) *
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
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                  >
                    <option value="">-- বরাদ্দ নির্বাচন করুন --</option>
                    {(activeAssignments || []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.customer.name} - {a.service.name} ({formatCurrency(a.customPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount & Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      পরিমাণ &#2547; *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      পদ্ধতি
                    </label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
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
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    নোট
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
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
                    পেমেন্ট যোগ করুন
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
