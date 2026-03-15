"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  CreditCard,
  Wallet,
  AlertCircle,
  FileText,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { formatCurrency, formatBanglaDate } from "@/lib/formatters";
import { ASSIGNMENT_STATUSES, PAYMENT_METHODS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  method: string;
  notes: string;
}

interface Assignment {
  id: string;
  customPrice: number;
  assignedDate: string;
  status: string;
  notes: string;
  service: {
    id: string;
    name: string;
    category: string;
  };
  payments: Payment[];
}

interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
  assignments: Assignment[];
  assignmentsCount: number;
  totalPayments: number;
}

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<"assignments" | "payments">("assignments");

  const { data: customer, error, isLoading } = useSWR<CustomerDetail>(
    `/api/customers/${id}`,
    fetcher
  );

  const totalAssigned = customer?.assignments.reduce(
    (sum, a) => sum + a.customPrice,
    0
  ) ?? 0;

  const totalPaid = customer?.totalPayments ?? 0;
  const pendingAmount = totalAssigned - totalPaid;

  const allPayments: (Payment & { serviceName: string; assignmentId: string })[] =
    customer?.assignments.flatMap((a) =>
      a.payments.map((p) => ({
        ...p,
        serviceName: a.service.name,
        assignmentId: a.id,
      }))
    ) ?? [];

  allPayments.sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  function getStatusBadge(status: string) {
    const found = ASSIGNMENT_STATUSES.find((s) => s.value === status);
    return found || { label: status, color: "bg-gray-100 text-gray-600" };
  }

  function getMethodLabel(method: string) {
    const found = PAYMENT_METHODS.find((m) => m.value === method);
    return found?.label || method;
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-[var(--bg-muted)] rounded" />
            <div className="h-7 w-48 bg-[var(--bg-muted)] rounded" />
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-full" />
              <div>
                <div className="h-6 w-40 bg-[var(--bg-muted)] rounded mb-2" />
                <div className="h-4 w-32 bg-[var(--bg-muted)] rounded" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="stat-card animate-pulse"
              >
                <div className="h-4 w-20 bg-[var(--bg-muted)] rounded mb-2" />
                <div className="h-7 w-28 bg-[var(--bg-muted)] rounded" />
              </div>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !customer) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-[var(--text-secondary)]">
            গ্রাহকের তথ্য লোড করা যায়নি
          </p>
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--brand-primary)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            গ্রাহক তালিকায় ফিরুন
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Back link */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        গ্রাহক তালিকা
      </Link>

      {/* Customer Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {customer.name}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[var(--text-secondary)]">
              {customer.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
            {customer.notes && (
              <p className="text-xs text-[var(--text-tertiary)] mt-2 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {customer.notes}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              মোট বরাদ্দ
            </span>
          </div>
          <p className="amount-text text-xl text-[var(--text-primary)]">
            {customer.assignmentsCount}
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
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              মোট পরিশোধ
            </span>
          </div>
          <p className="amount-text text-xl text-[var(--text-primary)]">
            {formatCurrency(totalPaid)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              বকেয়া
            </span>
          </div>
          <p
            className={cn(
              "amount-text text-xl",
              pendingAmount > 0
                ? "text-red-600"
                : "text-[var(--text-primary)]"
            )}
          >
            {formatCurrency(Math.max(0, pendingAmount))}
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[var(--bg-muted)] rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("assignments")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === "assignments"
              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <span className="flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            বরাদ্দ ({customer.assignments.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === "payments"
              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            পেমেন্ট ({allPayments.length})
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
        {activeTab === "assignments" ? (
          customer.assignments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">
                কোনো বরাদ্দ নেই
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
                      সেবা
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      মূল্য
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      পরিশোধ
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customer.assignments.map((assignment) => {
                    const badge = getStatusBadge(assignment.status);
                    const paid = assignment.payments.reduce(
                      (s, p) => s + p.amount,
                      0
                    );
                    return (
                      <tr
                        key={assignment.id}
                        className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                      >
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          {formatBanglaDate(assignment.assignedDate)}
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                          <span className="font-medium text-[var(--text-primary)]">
                            {assignment.service.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                          <span className="amount-text text-[var(--text-primary)]">
                            {formatCurrency(assignment.customPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                          <span className="amount-text text-emerald-600">
                            {formatCurrency(paid)}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full",
                              badge.color
                            )}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : allPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              কোনো পেমেন্ট নেই
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
                {allPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {formatBanglaDate(payment.paymentDate)}
                    </td>
                    <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                      <span className="text-[var(--text-primary)]">
                        {payment.serviceName}
                      </span>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
