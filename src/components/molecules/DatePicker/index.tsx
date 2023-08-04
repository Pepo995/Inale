/*
    This component is based on a ShadCN component.
    Here is the documentation link: https://ui.shadcn.com/docs/components/date-picker
*/

import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@utils";
import { Button } from "@atoms/Button";
import Calendar from "@atoms/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@atoms/Popover";
import { format } from "date-fns";
import {
  type Path,
  type FieldValues,
  Controller,
  type RegisterOptions,
} from "react-hook-form";

type DatePickerProps<T extends FieldValues> = {
  title?: string;
  name: Path<T>;
  rules?: RegisterOptions;
};

const DatePicker = <T extends FieldValues>({
  title,
  name,
  rules,
}: DatePickerProps<T>) => (
  <Controller
    name={name}
    rules={rules}
    render={({ field: { value, onChange }, fieldState: { error } }) => (
      <div className="flex flex-col gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start bg-secondary-foreground px-8 py-6 text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                format(value, "PPP")
              ) : (
                <span>{title || "Pick a date"}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {error?.message && (
          <p className="text-red-600">{String(error.message)}</p>
        )}
      </div>
    )}
  />
);

export default DatePicker;
