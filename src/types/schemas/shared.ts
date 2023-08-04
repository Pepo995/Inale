import { z } from "zod";

const positiveIntegerRegEx = /^[1-9]\d*$|^$/;

const DateValidation = z
  .string({
    invalid_type_error: "El formato debe ser dd/mm/aaaa",
  })
  .regex(
    /^(?!$)(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    "El formato de la fecha debe ser dd/mm/aaaa"
  );

const DateOrEmptyValidation = z
  .string({
    invalid_type_error: "El formato debe ser dd/mm/aaaa",
  })
  .regex(
    /^(?!$)(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$|^$/,
    "El formato de la fecha debe ser dd/mm/aaaa"
  );
const TimeValidation = z
  .string({
    invalid_type_error: "El formato debe ser hh:mm",
  })
  .regex(
    /^(?!$)([01][0-9]|2[0-3]):[0-5][0-9]$/,
    "El formato de la hora debe ser hh:mm"
  );

const PhoneValidation = z
  .string()
  .regex(/^.*\d{8}.*$|^$/, "Debe tener al menos 8 dígitos");

const NameValidation = z
  .string()
  .min(3, "El nombre debe tener al menos 3 caracteres.");

const RutValidation = z
  .string({
    required_error: "El RUT es requerido",
  })
  .regex(/^\d{12}$/, "Debe tener 12 dígitos");

const RutNumberValidation = z
  .number({
    required_error: "El RUT es requerido",
  })
  .min(111111111111, "Debe tener 12 dígitos")
  .max(999999999999, "Debe tener 12 dígitos");

export {
  positiveIntegerRegEx,
  DateValidation,
  DateOrEmptyValidation,
  TimeValidation,
  PhoneValidation,
  NameValidation,
  RutValidation,
  RutNumberValidation,
};
