"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import Link from "next/link";
import {
  Plus,
  ClipboardList,
  Eye,
  Filter,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, formatBanglaDate } from "@/lib/formatters";
import { ASSIGNMENT_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";

interface Assignment {
  id: string;
  customPrice: number;
  assignedDate: string;
  status: string;
  notes: string;
  customer: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
  };
}

export default function AssignmentsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const apiUrl = `/api/assignments${statusFilter ? `?status=${statusFilter}` : ""}`;
  const { data: assignments, error, isLoading } = useSWR<Assignment[]>(apiUrl, fetcher);

  function getStatusBadge(status: string) {
    const found = ASSIGNMENT_STATUSES.find((s) => s.value === status);
    return found || { label: status, color: "bg-gray-100 text-gray-600" };
  }

  return (
    <PageShell>
      <PageHeader title="সেবা বরাদ্দ" subtitle="সকল সেবা বরাদ্দের তালিকা">
        <Link
          href="/assignments/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          নতুন বরাদ্দ
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
          >
            <option value="">সকল স্ট্যাটাস</option>
            {ASSIGNMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
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
                  <div className="h-4 w-36 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-32 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-20 bg-[var(--bg-muted)] rounded" />
                  <div className="h-4 w-16 bg-[var(--bg-muted)] rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : !assignments || assignments.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              কোনো বরাদ্দ পাওয়া যায়নি
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              নতুন বরাদ্দ তৈরি করতে উপরের বাটনে ক্লিক করুন
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
                    মূল্য
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, i) => {
                  const badge = getStatusBadge(assignment.status);
                  return (
                    <motion.tr
                      key={assignment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                    >
                      <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {formatBanglaDate(assignment.assignedDate)}
                      </td>
                      <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                        <Link
                          href={`/customers/${assignment.customer.id}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors"
                        >
                          {assignment.customer.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-primary)]">
                        {assignment.service.name}
                      </td>
                      <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                        <span className="amount-text text-[var(--text-primary)]">
                          {formatCurrency(assignment.customPrice)}
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
                      <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-right">
                        <Link
                          href={`/customers/${assignment.customer.id}`}
                          className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors inline-flex"
                          title="বিস্তারিত"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
