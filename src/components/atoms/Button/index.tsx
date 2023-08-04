/*
    This component is based on a ShadCN component.
    Here is the documentation link: https://ui.shadcn.com/docs/components/button
*/

import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-gray-200",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        tertiary: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
        tertiaryLighter: "bg-tertiary/60 text-tertiary-foreground",
        success: "bg-success text-success-foreground hover:bg-success/80",
        cancel: "bg-cancel text-cancel-foreground hover:bg-cancel/80",
        warning: "bg-warning text-warning-foreground hover:bg-warning/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
      buttonColor: {
        default: "",
        tertiary: "",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        buttonColor: "tertiary",
        className: "text-tertiary border-tertiary",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      buttonColor: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, buttonColor, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, buttonColor, className })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
