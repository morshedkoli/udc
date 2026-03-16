"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
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
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleChange }}>
      {children}
    </DialogContext.Provider>
  );
}

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(DialogContext);
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
DialogTrigger.displayName = "DialogTrigger";

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(DialogContext);
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
DialogClose.displayName = "DialogClose";

const DialogOverlay = React.forwardRef<
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
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(DialogContext);

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
      <DialogOverlay onClick={() => ctx.onOpenChange(false)} />
      <div
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-xl dark:border-gray-700 dark:bg-gray-900",
          className
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-gray-900"
          onClick={() => ctx.onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
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
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
