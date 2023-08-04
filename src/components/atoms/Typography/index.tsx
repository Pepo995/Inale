import React, { type ReactNode } from "react";
import { type VariantProps, cva } from "class-variance-authority";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-xl sm:text-4xl sm:leading-9",
      h2: "text-base sm:text-xl sm:leading-6",
      h3: "text-base sm:text-base sm:leading-5",
      h4: "text-sm sm:text-base sm:leading-5",
      h5: "text-sm sm:leading-4",
      h6: "text-xs sm:text-sm sm:leading-4",
      text: "text-xs leading-3 sm:text-base sm:leading-4",
      error: "text-xs leadig-3 sm:text-base sm:leading-4",
    },
    color: {
      primary: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      tertiary: "text-tertiary-foreground",
      bgTertiary: "text-tertiary",
      bgSecondary: "text-secondary",
      gray: "text-gray-500",
      light: "text-neutral-400",
      error: "text-red-800",
    },
    weight: {
      bold: "font-bold",
      semibold: "font-semibold",
      medium: "font-medium",
      normal: "font-normal",
    },
    ellipsis: {
      true: "overflow-hidden text-ellipsis whitespace-nowrap",
    },
    display: {
      row: "flex flex-row gap-x-2 justify-between items-center",
      column: "flex flex-col gap-y-2 justify-between items-start",
      block: "block",
    },
    whitespace: {
      default: "whitespace-normal",
      nowrap: "whitespace-nowrap",
      pre: "whitespace-pre",
      preLine: "whitespace-pre-line",
      preWrap: "whitespace-pre-wrap",
    },
    text: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    textHeight: {
      default: "",
      full: "h-full",
    },
    marginBottom: {
      default: "mb-1",
      none: "mb-0",
    },
  },
  defaultVariants: {
    marginBottom: "default",
    variant: "text",
    color: "primary",
    display: "block",
    weight: "normal",
    text: "left",
    textHeight: "default",
    whitespace: "default",
  },
});
interface TypographyProps extends VariantProps<typeof typographyVariants> {
  children: ReactNode;
}

const Typography = ({
  children,
  marginBottom,
  variant,
  color,
  weight,
  textHeight,
  ellipsis,
  display,
  text,
  whitespace,
  ...props
}: TypographyProps) => (
  <div
    {...props}
    className={typographyVariants({
      marginBottom,
      variant,
      color,
      weight,
      textHeight,
      ellipsis,
      display,
      text,
      whitespace,
    })}
  >
    {children}
  </div>
);

export default Typography;
