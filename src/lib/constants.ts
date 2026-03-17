import { LayoutDashboard, Briefcase, Receipt, BarChart3, Settings, PlusCircle } from "lucide-react";

export const NAV_ITEMS = [
  {
    group: "Main",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Management",
    items: [
      { href: "/services", label: "Services", icon: Briefcase },
      { href: "/sales", label: "Sales Records", icon: Receipt },
    ],
  },
  {
    group: "Reports",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export const QUICK_ACTIONS = [
  { href: "/sales", label: "New Sale", icon: PlusCircle, color: "text-indigo-500" },
  { href: "/services", label: "New Service", icon: Briefcase, color: "text-violet-500" },
] as const;

export const SERVICE_CATEGORIES = [
  "General",
  "Government Services",
  "Online Applications",
  "Print & Scan",
  "Photo & Media",
  "Education",
  "Other",
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank", label: "Bank" },
  { value: "other", label: "Other" },
] as const;

export const ASSIGNMENT_STATUSES = [
  { value: "active", label: "Active", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
] as const;
