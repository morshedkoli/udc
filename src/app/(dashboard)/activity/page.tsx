"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Clock,
  Filter,
  User,
  Briefcase,
  ClipboardList,
  CreditCard,
  Activity as ActivityIcon,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const ENTITY_TYPES = [
  { value: "", label: "সকল" },
  { value: "customer", label: "গ্রাহক" },
  { value: "service", label: "সেবা" },
  { value: "assignment", label: "বরাদ্দ" },
  { value: "payment", label: "পেমেন্ট" },
];

function getEntityIcon(entityType: string) {
  switch (entityType) {
    case "customer":
      return User;
    case "service":
      return Briefcase;
    case "assignment":
      return ClipboardList;
    case "payment":
      return CreditCard;
    default:
      return Clock;
  }
}

function getEntityBgColor(entityType: string) {
  switch (entityType) {
    case "customer":
      return "bg-emerald-50";
    case "service":
      return "bg-purple-50";
    case "assignment":
      return "bg-blue-50";
    case "payment":
      return "bg-amber-50";
    default:
      return "bg-gray-50";
  }
}

function getEntityTextColor(entityType: string) {
  switch (entityType) {
    case "customer":
      return "text-emerald-600";
    case "service":
      return "text-purple-600";
    case "assignment":
      return "text-blue-600";
    case "payment":
      return "text-amber-600";
    default:
      return "text-gray-600";
  }
}

export default function ActivityPage() {
  const [filter, setFilter] = useState("");

  const apiUrl = `/api/activity?type=${filter}&limit=100`;
  const { data: activities, error, isLoading } = useSWR<ActivityLog[]>(apiUrl, fetcher);

  return (
    <PageShell>
      <PageHeader title="কার্যকলাপ" subtitle="সকল কার্যকলাপের টাইমলাইন" />

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[var(--color-error-light)] border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ডাটা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।
        </div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-start gap-4">
              <div className="w-10 h-10 bg-[var(--bg-muted)] rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-64 bg-[var(--bg-muted)] rounded mb-2" />
                <div className="h-3 w-32 bg-[var(--bg-muted)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !activities || activities.length === 0 ? (
        <div className="text-center py-16">
          <ActivityIcon className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            কোনো কার্যকলাপ পাওয়া যায়নি
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            কার্যকলাপ স্বয়ংক্রিয়ভাবে রেকর্ড হবে
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border-subtle)]" />

          <div className="space-y-1">
            {activities.map((activity, i) => {
              const Icon = getEntityIcon(activity.entityType);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  {/* Dot / Icon */}
                  <div
                    className={cn(
                      "relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      getEntityBgColor(activity.entityType)
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        getEntityTextColor(activity.entityType)
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                          <span
                            className={cn(
                              "inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded mr-1.5",
                              getEntityBgColor(activity.entityType),
                              getEntityTextColor(activity.entityType)
                            )}
                          >
                            {activity.action}
                          </span>
                          {activity.details}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap flex-shrink-0 pt-0.5">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </PageShell>
  );
}
