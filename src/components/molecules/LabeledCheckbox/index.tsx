import React from "react";

import {
  type Path,
  type FieldValues,
  useFormContext,
  type RegisterOptions,
} from "react-hook-form";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@utils";

const CheckboxVariants = cva("rounded-xl border border-secondary", {
  variants: {
    checkboxSize: {
      sm: "w-3 h-3",
      md: "w-4 h-4",
    },
  },
  defaultVariants: {
    checkboxSize: "md",
  },
});

const LabelVariants = cva(
  "leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      labelSize: {
        sm: "text-xs font-normal",
        md: "text-sm font-medium",
      },
    },
    defaultVariants: {
      labelSize: "md",
    },
  }
);

type LabeledCheckboxProps<T extends FieldValues> = {
  label: string;
  id?: string;
  name: Path<T>;
  rules?: RegisterOptions;
} & React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof CheckboxVariants> &
  VariantProps<typeof LabelVariants>;

const LabeledCheckbox = <T extends FieldValues>({
  label,
  id,
  name,
  rules,
  labelSize,
  checkboxSize,
  ...props
}: LabeledCheckboxProps<T>) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register(name, rules)}
          id={id}
          className={cn(CheckboxVariants({ checkboxSize }))}
          {...props}
        />
        <label className={cn(LabelVariants({ labelSize }))} htmlFor={id}>
          {label}
        </label>
      </div>
      {errors[name]?.message && (
        <p className="text-red-600">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default LabeledCheckbox;
