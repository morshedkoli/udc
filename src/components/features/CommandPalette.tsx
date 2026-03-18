"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Users,
  Briefcase,
  ClipboardList,
  CreditCard,
  PlusCircle,
  BarChart3,
  Activity,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { SearchResult } from "@/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  customer: <Users className="h-4 w-4 text-emerald-500" />,
  service: <Briefcase className="h-4 w-4 text-violet-500" />,
  assignment: <ClipboardList className="h-4 w-4 text-blue-500" />,
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Services", href: "/services", icon: Briefcase },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

const QUICK_ACTIONS = [
  { label: "New Assignment", href: "/assignments/new", icon: PlusCircle },
  { label: "New Customer", href: "/customers?new=true", icon: Users },
  { label: "New Service", href: "/services?new=true", icon: Briefcase },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      router.push(href);
    },
    [router, onOpenChange]
  );

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const customerResults = results.filter((r) => r.type === "customer");
  const serviceResults = results.filter((r) => r.type === "service");
  const assignmentResults = results.filter((r) => r.type === "assignment");

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search customers, services, assignments..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? "Searching..." : query ? "No results found." : "Type to search..."}
        </CommandEmpty>

        {/* Search Results */}
        {customerResults.length > 0 && (
          <CommandGroup heading="Customers">
            {customerResults.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                {ICON_MAP[r.type]}
                <div className="ml-2 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.subtitle}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {serviceResults.length > 0 && (
          <CommandGroup heading="Services">
            {serviceResults.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                {ICON_MAP[r.type]}
                <div className="ml-2 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.subtitle}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {assignmentResults.length > 0 && (
          <CommandGroup heading="Assignments">
            {assignmentResults.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleSelect(r.href)}>
                {ICON_MAP[r.type]}
                <div className="ml-2 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.subtitle}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Quick actions when no query */}
        {!query && (
          <>
            <CommandGroup heading="Quick Actions">
              {QUICK_ACTIONS.map((action) => (
                <CommandItem key={action.href} onSelect={() => handleSelect(action.href)}>
                  <action.icon className="h-4 w-4 text-indigo-500" />
                  <span className="ml-2">{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigation">
              {NAV_ITEMS.map((item) => (
                <CommandItem key={item.href} onSelect={() => handleSelect(item.href)}>
                  <item.icon className="h-4 w-4" />
                  <span className="ml-2">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
