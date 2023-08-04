import * as z from "zod";

const positiveIntegerRegEx = /^[1-9]\d*$|^$/;

const initialVolumeSchema = z.object({
  initialVolume: z
    .string()
    .regex(positiveIntegerRegEx, "El volumen debe ser un número positivo")
    .optional(),
});
const weightBeforeSaltingSchema = z.object({
  weightBeforeSalting: z
    .string()
    .regex(positiveIntegerRegEx, "El peso debe ser un número positivo")
    .optional(),
});
const weightAfterMaturationSchema = z.object({
  weightAfterMaturation: z
    .string()
    .regex(positiveIntegerRegEx, "El peso debe ser un número positivo")
    .optional(),
});

export {
  initialVolumeSchema,
  weightBeforeSaltingSchema,
  weightAfterMaturationSchema,
};
