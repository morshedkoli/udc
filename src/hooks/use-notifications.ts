import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Notification } from "@/types";

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<Notification[]>(
    "/api/notifications",
    fetcher,
    { refreshInterval: 30000 }
  );

  const unreadCount = data?.filter((n) => !n.read).length || 0;

  async function markAllRead() {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      mutate();
    } catch {
      // silently fail
    }
  }

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      mutate();
    } catch {
      // silently fail
    }
  }

  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    error,
    markAllRead,
    markRead,
    refresh: mutate,
  };
}
