import { LayoutDashboard, Users, Briefcase, ClipboardList, CreditCard, BarChart3, Activity, Settings, PlusCircle } from "lucide-react";

export const NAV_ITEMS = [
  {
    group: "প্রধান",
    items: [
      { href: "/", label: "Dashboard", labelBn: "ড্যাশবোর্ড", icon: LayoutDashboard },
    ],
  },
  {
    group: "ব্যবস্থাপনা",
    items: [
      { href: "/customers", label: "Customers", labelBn: "গ্রাহক", icon: Users },
      { href: "/services", label: "Services", labelBn: "সেবা", icon: Briefcase },
      { href: "/assignments", label: "Assignments", labelBn: "বরাদ্দ", icon: ClipboardList },
      { href: "/payments", label: "Payments", labelBn: "পেমেন্ট", icon: CreditCard },
    ],
  },
  {
    group: "রিপোর্ট",
    items: [
      { href: "/reports", label: "Reports", labelBn: "রিপোর্ট", icon: BarChart3 },
      { href: "/activity", label: "Activity", labelBn: "কার্যকলাপ", icon: Activity },
    ],
  },
  {
    group: "সিস্টেম",
    items: [
      { href: "/settings", label: "Settings", labelBn: "সেটিংস", icon: Settings },
    ],
  },
] as const;

export const QUICK_ACTIONS = [
  { href: "/assignments/new", label: "নতুন বরাদ্দ", icon: PlusCircle, color: "text-indigo-500" },
  { href: "/customers?new=true", label: "নতুন গ্রাহক", icon: Users, color: "text-emerald-500" },
  { href: "/services?new=true", label: "নতুন সেবা", icon: Briefcase, color: "text-amber-500" },
] as const;

export const SERVICE_CATEGORIES = [
  "সাধারণ",
  "সরকারি সেবা",
  "অনলাইন আবেদন",
  "প্রিন্ট ও স্ক্যান",
  "ছবি ও মিডিয়া",
  "শিক্ষা",
  "অন্যান্য",
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "নগদ" },
  { value: "bkash", label: "বিকাশ" },
  { value: "nagad", label: "নগদ (Nagad)" },
  { value: "bank", label: "ব্যাংক" },
  { value: "other", label: "অন্যান্য" },
] as const;

export const ASSIGNMENT_STATUSES = [
  { value: "active", label: "সক্রিয়", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "সম্পন্ন", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "বাতিল", color: "bg-red-100 text-red-700" },
] as const;
