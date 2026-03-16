"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoadingStatusChange, ...props }, ref) => {
    const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

    React.useEffect(() => {
      onLoadingStatusChange?.(status);
    }, [status, onLoadingStatusChange]);

    if (status === "error") return null;

    return (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full", className)}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
