/*
    This component is based on a ShadCN component.
    Here is the documentation link: https://ui.shadcn.com/docs/components/input
*/

import React, { type InputHTMLAttributes, forwardRef } from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@utils";

const textInputVariants = cva(
  "flex h-full w-full rounded-md border border-input bg-secondary-foreground px-3 text-sm focus-visible:outline-none focus-visible:ring-0 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-secondary",
        secondary: "bg-primary-foreground text-primary border-white",
        disabled: "h-10 mt-1 mb-2 disabled:opacity-100 disabled:cursor-default",
        form: "h-10 mt-1 mb-2",
      },
      sizeVariant: {
        sm: "py-1",
        md: "py-2",
      },
      margin: {
        none: "m-0",
      },
    },
    defaultVariants: {
      variant: "default",
      sizeVariant: "sm",
    },
  }
);

export type TextInputProps = VariantProps<typeof textInputVariants> &
  InputHTMLAttributes<HTMLInputElement>;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, variant, type, sizeVariant, margin, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        textInputVariants({ variant, sizeVariant, margin }),
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

TextInput.displayName = "TextInput";

export default TextInput;
