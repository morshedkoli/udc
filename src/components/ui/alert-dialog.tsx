"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function AlertDialog({ children, open: controlledOpen, onOpenChange }: AlertDialogProps) {
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
    <AlertDialogContext.Provider value={{ open: isOpen, onOpenChange: handleChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(AlertDialogContext);
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
AlertDialogTrigger.displayName = "AlertDialogTrigger";

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const AlertDialogOverlay = React.forwardRef<
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
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(AlertDialogContext);

  React.useEffect(() => {
    if (!ctx.open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ctx.open]);

  if (!ctx.open) return null;

  return (
    <>
      <AlertDialogOverlay />
      <div
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-xl dark:border-gray-700 dark:bg-gray-900",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({
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
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
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
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
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
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const ctx = React.useContext(AlertDialogContext);
  return (
    <button
      ref={ref}
      className={cn(buttonVariants(), className)}
      onClick={(e) => {
        onClick?.(e);
        ctx.onOpenChange(false);
      }}
      {...props}
    />
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const ctx = React.useContext(AlertDialogContext);
  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
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
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
