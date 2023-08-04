import React, { type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@atoms/Card";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@utils";

const DashboardCardVariants = cva("flex h-full flex-col justify-between", {
  variants: {
    xAxisScrollable: {
      true: "overflow-x-scroll",
    },
  },
  defaultVariants: {
    xAxisScrollable: false,
  },
});
type DashboardCard = {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
} & VariantProps<typeof DashboardCardVariants>;

const DashboardCard = ({
  title,
  icon,
  children,
  footer,
  xAxisScrollable,
}: DashboardCard) => (
  <Card
    className={`${cn(
      DashboardCardVariants({ xAxisScrollable })
    )} flex h-full flex-col justify-between`}
  >
    {title && (
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="w-2/3 font-Inter">{title}</CardTitle>
        {icon && <div className="ml-3 flex w-1/3 justify-center">{icon}</div>}
      </CardHeader>
    )}
    <CardContent>{children}</CardContent>
    {footer && <CardFooter>{footer}</CardFooter>}
  </Card>
);

export default DashboardCard;
