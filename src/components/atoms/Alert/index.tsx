/*
    This component is based on a ShadCN component.
    Here is the documentation link: https://ui.shadcn.com/docs/components/alert
*/

import * as React from "react";
import { Bell, X } from "lucide-react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@utils";

const alertVariants = cva("flex h-full w-96 rounded-[8px]", {
  variants: {
    alertVariant: {
      default: "rounded border border-solid border-gray-300 bg-white",
      success: "bg-alert-success text-alert-success-foreground",
      error: "bg-alert-error text-alert-error-foreground",
      warning: "bg-alert-warning text-alert-warning-foreground",
    },
  },
  defaultVariants: {
    alertVariant: "default",
  },
});

const notificationVariants = cva("rounded-s", {
  variants: {
    notificationVariant: {
      default: "bg-black bg-opacity-10",
      blue: "bg-tertiary",
      green: "bg-success",
      yellow: "bg-warning",
    },
  },
  defaultVariants: {
    notificationVariant: "default",
  },
});

const bellVariants = cva("m-5 flex", {
  variants: {
    bellVariant: {
      default: "stroke-black",
      white: "stroke-white",
    },
  },
  defaultVariants: {
    bellVariant: "default",
  },
});

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> &
    VariantProps<typeof notificationVariants> &
    VariantProps<typeof bellVariants> & { onClose: () => void }
>(
  (
    {
      className,
      alertVariant,
      notificationVariant,
      bellVariant,
      children,
      onClose,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ alertVariant }), className)}
      {...props}
    >
      <div
        className={cn(notificationVariants({ notificationVariant }), className)}
      >
        <Bell
          className={cn(bellVariants({ bellVariant }), className)}
          width={16}
          height={16}
        />
      </div>
      <div className="my-auto ml-4 w-full">{children}</div>
      <button className="mr-3" onClick={onClose}>
        <X className="text-alert-success-foreground" width={24} height={24} />
      </button>
    </div>
  )
);
Alert.displayName = "Alert";

export { Alert };
