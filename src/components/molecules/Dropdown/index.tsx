import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@atoms/SelectInput";
import {
  Controller,
  type RegisterOptions,
  type FieldValues,
  type Path,
} from "react-hook-form";

type DropdownOption = {
  id: string;
  label: string;
};

type DropdownProps<T extends FieldValues> = {
  options: DropdownOption[];
  categoryLabel?: string;
  placeholder: string;
  name: Path<T>;
  rules?: RegisterOptions;
};

const SelectDropdown = <T extends FieldValues>({
  categoryLabel,
  placeholder,
  rules,
  name,
  options,
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <div className="flex flex-col gap-2">
          <Select
            /**
             * This is a workaround to prevent this bug until it's solved by radixUI: https://github.com/radix-ui/primitives/issues/1658
             * When it's solved, we can removed the open and setOpen in this file.
             **/
            onOpenChange={() => {
              setTimeout(() => {
                setOpen(!open);
              }, 10);
            }}
            open={open}
            value={value}
            onValueChange={(value: string) => onChange(value)}
          >
            <SelectTrigger className="w-full bg-secondary-foreground">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-auto">
              <SelectGroup>
                {categoryLabel && <SelectLabel>{categoryLabel}</SelectLabel>}
                {options.map(({ id, label }, index) => (
                  <SelectItem value={id} key={index}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {error?.message && (
            <p className="text-red-600">{String(error.message)}</p>
          )}
        </div>
      )}
    />
  );
};

export default SelectDropdown;
