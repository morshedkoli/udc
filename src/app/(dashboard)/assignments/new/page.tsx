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
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  defaultPrice: number;
  category: string;
  status: string;
}

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
      toast.error("গ্রাহক নির্বাচন করুন");
      return;
    }
    if (!serviceId) {
      toast.error("সেবা নির্বাচন করুন");
      return;
    }
    if (customPrice <= 0) {
      toast.error("মূল্য সঠিকভাবে লিখুন");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create assignment
      const assignmentRes = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          serviceId,
          customPrice,
          assignedDate,
          notes,
          status: "active",
        }),
      });

      if (!assignmentRes.ok) {
        const err = await assignmentRes.json();
        throw new Error(err.error || "সেবা বরাদ্দ তৈরি ব্যর্থ");
      }

      const newAssignment = await assignmentRes.json();

      // Step 2: Create payment if checked
      if (addPayment && paymentAmount > 0) {
        const paymentRes = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignmentId: newAssignment.id,
            amount: paymentAmount,
            method: paymentMethod,
            notes: "",
          }),
        });

        if (!paymentRes.ok) {
          // Assignment created but payment failed
          toast.warning("বরাদ্দ তৈরি হয়েছে, কিন্তু পেমেন্ট যোগ করা যায়নি");
          router.push("/assignments");
          return;
        }
      }

      toast.success("সেবা বরাদ্দ সফল!");
      router.push("/assignments");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "কিছু সমস্যা হয়েছে";
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
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        বরাদ্দ তালিকা
      </Link>

      <PageHeader title="নতুন সেবা বরাদ্দ" subtitle="গ্রাহককে সেবা প্রদানের জন্য বরাদ্দ তৈরি করুন" />

      {isDataLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
          <span className="ml-3 text-sm text-[var(--text-secondary)]">ডাটা লোড হচ্ছে...</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Select */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                গ্রাহক *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
              >
                <option value="">-- গ্রাহক নির্বাচন করুন --</option>
                {(customers || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Select */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                সেবা *
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
              >
                <option value="">-- সেবা নির্বাচন করুন --</option>
                {(services || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category}) - {formatCurrency(s.defaultPrice)}
                  </option>
                ))}
              </select>
              {selectedService && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  ডিফল্ট মূল্য: {formatCurrency(selectedService.defaultPrice)}
                </p>
              )}
            </div>

            {/* Price & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  মূল্য &#2547; *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  তারিখ
                </label>
                <input
                  type="date"
                  value={assignedDate}
                  onChange={(e) => setAssignedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                নোট
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)] resize-none"
                placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
              />
            </div>

            {/* Payment Toggle */}
            <div className="border-t border-[var(--border-subtle)] pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addPayment}
                  onChange={(e) => setAddPayment(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    এই মুহূর্তে পেমেন্ট যোগ করুন
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
                className="bg-[var(--bg-muted)] rounded-lg p-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      পেমেন্ট পরিমাণ &#2547;
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      পদ্ধতি
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
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
              </motion.div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/assignments"
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-muted)] rounded-lg transition-colors"
              >
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                বরাদ্দ তৈরি করুন
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </PageShell>
  );
}
