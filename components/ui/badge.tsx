"use client";

import * as React from "react";
import { cn } from "@/lib/utils/helpers";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  size?: "default" | "sm" | "lg";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
      success: "border-transparent bg-success text-white hover:bg-success/80",
      warning: "border-transparent bg-warning text-white hover:bg-warning/80",
    };

    const sizes = {
      default: "px-2.5 py-0.5 text-xs font-semibold",
      sm: "px-2 py-0.5 text-xs font-medium",
      lg: "px-3 py-1 text-sm font-medium",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border font-medium transition-colors",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
