import { type LucideIcon } from "lucide-react";
import React from "react";
import Typography from "@atoms/Typography";

type DropdownNotificationItemProps = {
  label: string;
  description?: string;
  creationTime: string;
  Icon?: LucideIcon;
  index: number;
};

const DropdownNotificationItem = ({
  label,
  description,
  creationTime,
  Icon,
  index,
}: DropdownNotificationItemProps) => (
  <div
    key={index}
    className="flex cursor-pointer justify-start gap-8 px-5 py-3 text-start focus:bg-gray-100"
  >
    {Icon && (
      <div className="inline-flex items-center">
        <Icon />
      </div>
    )}
    <div className="flex flex-col items-start justify-start gap-1">
      <Typography variant="h6">{label}</Typography>
      {description && (
        <Typography variant="h6" color="gray">
          {description}
        </Typography>
      )}
      <Typography variant="h6" color="gray">
        {creationTime}
      </Typography>
    </div>
  </div>
);

export default DropdownNotificationItem;
