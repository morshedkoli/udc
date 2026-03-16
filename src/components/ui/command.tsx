"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-lg bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
));
Command.displayName = "Command";

interface CommandDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
};

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onValueChange, onChange, ...props }, ref) => (
    <div className="flex items-center border-b border-gray-200 px-3 dark:border-gray-700">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-gray-500",
          className
        )}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        {...props}
      />
    </div>
  )
);
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "max-h-[300px] overflow-y-auto overflow-x-hidden",
      className
    )}
    {...props}
  />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div
    ref={ref}
    className="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    >
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          {heading}
        </div>
      )}
      {children}
    </div>
  )
);
CommandGroup.displayName = "CommandGroup";

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 h-px bg-gray-200 dark:bg-gray-700", className)}
    {...props}
  />
));
CommandSeparator.displayName = "CommandSeparator";

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: () => void;
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, onSelect, onClick, ...props }, ref) => (
    <div
      ref={ref}
      role="option"
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        onSelect?.();
      }}
      {...props}
    />
  )
);
CommandItem.displayName = "CommandItem";

const CommandShortcut = ({
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
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
