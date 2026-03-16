"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue>({
  open: false,
  onOpenChange: () => {},
});

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const handleChange = React.useCallback(
    (v: boolean) => {
      setInternalOpen(v);
      onOpenChange?.(v);
    },
    [onOpenChange]
  );

  return (
    <PopoverContext.Provider value={{ open: isOpen, onOpenChange: handleChange }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(PopoverContext);
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        ctx.onOpenChange(!ctx.open);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverAnchor = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
PopoverAnchor.displayName = "PopoverAnchor";

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number }
>(({ className, align: _align, sideOffset: _sideOffset, ...props }, ref) => {
  const ctx = React.useContext(PopoverContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ctx.open) return;
    function handleClickOutside(e: MouseEvent) {
      if (contentRef.current && !contentRef.current.closest(".relative")?.contains(e.target as Node)) {
        ctx.onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ctx]);

  if (!ctx.open) return null;

  return (
    <div
      ref={(node) => {
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn(
        "absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg outline-none dark:border-gray-700 dark:bg-gray-900",
        className
      )}
      {...props}
    />
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
