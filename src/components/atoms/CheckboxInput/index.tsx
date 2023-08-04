/*
    This component is based on a ShadCN component.
    Here is the documentation link: https://ui.shadcn.com/docs/components/checkbox
*/

import React, {
  type ElementRef,
  forwardRef,
  type ComponentPropsWithoutRef,
} from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@utils";

const CheckboxRootVariants = cva(
  "peer shrink-0 rounded-sm border border-secondary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground",
  {
    variants: {
      sizeVariant: {
        sm: "w-3 h-3",
        md: "w-4 h-4",
      },
    },
    defaultVariants: {
      sizeVariant: "md",
    },
  }
);

const CheckboxIndicatorVariants = cva("", {
  variants: {
    indicatorSizeVariant: {
      sm: "w-3 h-3",
      md: "w-4 h-4",
    },
  },
});

export type CheckboxProps = VariantProps<typeof CheckboxRootVariants> &
  VariantProps<typeof CheckboxIndicatorVariants> &
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

const CheckboxInput = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, sizeVariant, indicatorSizeVariant, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(CheckboxRootVariants({ sizeVariant }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check
        className={cn(CheckboxIndicatorVariants({ indicatorSizeVariant }))}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
CheckboxInput.displayName = CheckboxPrimitive.Root.displayName;

export default CheckboxInput;
