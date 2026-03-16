"use client";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { FileX2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string;
  skeletonRows?: number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyIcon = FileX2,
  emptyTitle = "No data found",
  emptyDescription,
  emptyAction,
  onRowClick,
  rowKey,
  skeletonRows = 5,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-[var(--border-subtle)] overflow-hidden", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={cn("rounded-xl border border-[var(--border-subtle)] overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.className
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={rowKey ? rowKey(row) : index}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.render
                    ? col.render(row, index)
                    : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
