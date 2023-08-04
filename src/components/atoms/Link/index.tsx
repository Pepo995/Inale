import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@utils"
import Link from 'next/link';

const linkVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "underline-offset-4 hover:underline text-primary",
        primary: "bg-primary text-primary-foreground hover:bg-gray-200",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        tertiary: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> { href: string }

const CustomLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, ...props }) => {
    return (
      <Link
        className={cn(linkVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
CustomLink.displayName = "Link";

export { CustomLink as Link, linkVariants };
