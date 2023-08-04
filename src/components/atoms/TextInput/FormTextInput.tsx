import type { HTMLInputTypeAttribute } from "react";
import TextInput, { type TextInputProps } from "./TextInput";
import { type VariantProps, cva } from "class-variance-authority";
import {
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import Typography from "../Typography";
import { cn } from "@utils";

const formTextInputVariants = cva(`flex h-min items-center gap-2`, {
  variants: {
    labelFormat: {
      default: "flex-row justify-between",
      reverse: "flex-row-reverse",
    },
  },
  defaultVariants: {
    labelFormat: "default",
  },
});

type FormTextInputProps<T extends FieldValues> = VariantProps<
  typeof formTextInputVariants
> & {
  name: Path<T>;
  type: HTMLInputTypeAttribute;
  rules?: RegisterOptions;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
} & TextInputProps;

const FormTextInput = <T extends FieldValues>({
  name,
  type,
  rules,
  placeholder,
  label,
  disabled = false,
  labelFormat,
  variant = "form",
  margin,
  ...props
}: FormTextInputProps<T>) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col">
      <div className={formTextInputVariants({ labelFormat })}>
        {label && (
          <div className="w-1/2">
            <Typography variant="text">{label}</Typography>
          </div>
        )}
        <TextInput
          type={type}
          {...register(name, rules)}
          placeholder={placeholder}
          disabled={disabled}
          variant={variant}
          margin={margin}
          {...props}
        />
      </div>
      {errors[name]?.message && (
        <div
          className={cn("mt-1 self-end", {
            "w-2/3": label,
            "w-full": !label,
          })}
        >
          <Typography variant="error" color="error">
            {String(errors[name]?.message)}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default FormTextInput;
