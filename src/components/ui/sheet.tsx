"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  onOpenChange: () => {},
});

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
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
    <SheetContext.Provider value={{ open: isOpen, onOpenChange: handleChange }}>
      {children}
    </SheetContext.Provider>
  );
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(SheetContext);
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        ctx.onOpenChange(true);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
SheetTrigger.displayName = "SheetTrigger";

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(SheetContext);
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        ctx.onOpenChange(false);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
SheetClose.displayName = "SheetClose";

function SheetPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const sideStyles = {
  top: "inset-x-0 top-0 border-b border-gray-200 dark:border-gray-700 animate-in slide-in-from-top",
  bottom: "inset-x-0 bottom-0 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom",
  left: "inset-y-0 left-0 h-full w-3/4 border-r border-gray-200 dark:border-gray-700 animate-in slide-in-from-left sm:max-w-sm",
  right: "inset-y-0 right-0 h-full w-3/4 border-l border-gray-200 dark:border-gray-700 animate-in slide-in-from-right sm:max-w-sm",
} as const;

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: keyof typeof sideStyles;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "left", className, children, ...props }, ref) => {
    const ctx = React.useContext(SheetContext);

    React.useEffect(() => {
      if (!ctx.open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") ctx.onOpenChange(false);
      };
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }, [ctx]);

    if (!ctx.open) return null;

    return (
      <>
        <SheetOverlay onClick={() => ctx.onOpenChange(false)} />
        <div
          ref={ref}
          className={cn(
            "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out dark:bg-gray-900",
            sideStyles[side],
            className
          )}
          {...props}
        >
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-gray-900"
            onClick={() => ctx.onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </>
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
