import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@utils";

const percentageVariants = cva(
  "inline-flex items-center border rounded-full px-1 mr-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        positive: "bg-green-100 border-transparent text-green-600",
        negative: "bg-red-100 border-transparent text-red-600",
      },
    },
    defaultVariants: {
      variant: "positive",
    },
  }
);

export interface PercentageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof percentageVariants> {
  percentage: number;
}

const Percentage = ({ className, percentage, ...props }: PercentageProps) => (
  <div
    className={cn(
      percentageVariants({
        variant: percentage > 0 ? "positive" : "negative",
      }),
      className
    )}
    {...props}
  >
    {percentage}%
  </div>
);

export { Percentage };
