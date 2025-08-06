import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
      size: {
        sm: "text-xs py-2 px-3",
        md: "text-sm py-3 px-4",
        lg: "text-base py-4 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export function Alert({
  className,
  variant,
  size,
  close,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    size?: "sm" | "md" | "lg";
    close?: boolean;
  }) {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div role="alert" className={cn(alertVariants({ variant, size }), className)} {...props}>
      {children}
      {close && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function AlertIcon({ children }: { children: React.ReactNode }) {
  return <div className="col-start-1">{children}</div>;
}

export function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-medium", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm opacity-80", className)} {...props} />;
}
