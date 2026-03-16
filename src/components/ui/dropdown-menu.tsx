"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  onOpenChange: () => {},
});

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
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
    <DropdownMenuContext.Provider value={{ open: isOpen, onOpenChange: handleChange }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(DropdownMenuContext);
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
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div role="group">{children}</div>;
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <div role="radiogroup">{children}</div>;
}

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </div>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900",
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number; align?: "start" | "end" | "center" }
>(({ className, sideOffset: _sideOffset, align = "start", ...props }, ref) => {
  const ctx = React.useContext(DropdownMenuContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ctx.open) return;
    function handleClickOutside(e: MouseEvent) {
      if (contentRef.current && !contentRef.current.closest(".relative")?.contains(e.target as Node)) {
        ctx.onOpenChange(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") ctx.onOpenChange(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
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
        "absolute top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-gray-700 dark:bg-gray-900",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, onClick, ...props }, ref) => {
  const ctx = React.useContext(DropdownMenuContext);
  return (
    <div
      ref={ref}
      role="menuitem"
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        ctx.onOpenChange(false);
      }}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }
>(({ className, children, checked, ...props }, ref) => (
  <div
    ref={ref}
    role="menuitemcheckbox"
    aria-checked={checked}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }
>(({ className, children, checked, ...props }, ref) => (
  <div
    ref={ref}
    role="menuitemradio"
    aria-checked={checked}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Circle className="h-2 w-2 fill-current" />}
    </span>
    {children}
  </div>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-gray-400 dark:text-gray-500",
        className
      )}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
