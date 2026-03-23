import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  [
    "inline-flex items-center",
    "rounded-full border px-2.5 py-0.5",
    "text-xs font-medium",
    "transition-colors duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent-subtle text-accent",
        secondary:
          "border-transparent bg-surface-sunken text-text-secondary",
        outline:
          "border-border text-text-secondary",
        warning:
          "border-transparent bg-warning-subtle text-warning",
        alert:
          "border-transparent bg-alert-subtle text-alert",
        success:
          "border-transparent bg-success-subtle text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
