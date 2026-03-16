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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ASSIGNMENT_STATUSES } from "@/lib/constants";
import { fetcher } from "@/lib/fetcher";
import type { AssignmentWithRelations } from "@/types";

export default function AssignmentsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const apiUrl = `/api/assignments${statusFilter ? `?status=${statusFilter}` : ""}`;
  const { data: assignments, error, isLoading } = useSWR<AssignmentWithRelations[]>(apiUrl, fetcher);

  return (
    <PageShell>
      <PageHeader title="Service Assignments" subtitle="List of all service assignments">
        <Link
          href="/assignments/new"
          className="btn btn-primary"
        >
          <Plus />
          New Assignment
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-tertiary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
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
        ) : !assignments || assignments.length === 0 ? (
          <div className="empty-state-small">
            <ClipboardList />
            <p>No assignments found</p>
            <span>Click the button above to create a new assignment</span>
          </div>
        ) : (
          <div className="table-overflow">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="table-header-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, i) => (
                  <motion.tr
                    key={assignment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="text-secondary">
                      {formatDate(assignment.assignedDate)}
                    </td>
                    <td>
                      <Link
                        href={`/customers/${assignment.customer.id}`}
                        className="font-medium text-primary hover:text-brand-primary transition-colors"
                      >
                        {assignment.customer.name}
                      </Link>
                    </td>
                    <td className="text-primary">
                      {assignment.service.name}
                    </td>
                    <td>
                      <span className="service-price">
                        {formatCurrency(assignment.customPrice)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={assignment.status} />
                    </td>
                    <td>
                      <Link
                        href={`/customers/${assignment.customer.id}`}
                        className="action-btn edit"
                        title="View Details"
                      >
                        <Eye />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
