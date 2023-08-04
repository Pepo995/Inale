import React from "react";
import { Controller } from "react-hook-form";

export interface NumberInputProps {
  id: string;
  name: string;
}

export const NumberInput = ({ id, name }: NumberInputProps) => (
  <Controller
    name={name}
    render={({ field: { value, onChange } }) => (
      <input
        onChange={onChange}
        value={value as number}
        type="number"
        id={id}
        min="1"
        className="text-center"
      />
    )}
  />
);
