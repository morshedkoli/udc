"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-blue-500" />,
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  error: <XCircle className="w-4 h-4 text-rose-500" />,
};

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function handleNotificationClick(notification: Notification) {
    markRead(notification.id);
    if (notification.href) {
      router.push(notification.href);
    }
    setOpen(false);
  }

  // Group notifications: today vs earlier
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayNotifications = notifications.filter((n) => new Date(n.createdAt) >= todayStart);
  const earlierNotifications = notifications.filter((n) => new Date(n.createdAt) < todayStart);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)] transition-colors duration-150 relative"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden z-[60]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-tertiary)]">No notifications yet</p>
              </div>
            ) : (
              <>
                {todayNotifications.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider bg-[var(--bg-muted)]">
                      Today
                    </div>
                    {todayNotifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onClick={() => handleNotificationClick(n)}
                      />
                    ))}
                  </div>
                )}
                {earlierNotifications.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider bg-[var(--bg-muted)]">
                      Earlier
                    </div>
                    {earlierNotifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onClick={() => handleNotificationClick(n)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-surface-hover)] transition-colors border-b border-[var(--border-subtle)] last:border-0",
        !notification.read && "bg-indigo-50/50 dark:bg-indigo-950/10"
      )}
    >
      <div className="mt-0.5 shrink-0">
        {TYPE_ICONS[notification.type] || TYPE_ICONS.info}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {notification.href && (
        <Check className="w-3.5 h-3.5 text-[var(--text-tertiary)] mt-1 shrink-0" />
      )}
    </button>
  );
}
