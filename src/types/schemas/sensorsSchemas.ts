import { z } from "zod";
import { RutNumberValidation } from "./shared";

const baseSensorSchema = z.object({
  dairyRut: RutNumberValidation,
  datetime: z
    .string({
      required_error: "No se recibió fecha y hora (datetime)",
      invalid_type_error: "El tipo de fecha y hora (datetime) debe ser string",
    })
    .regex(/^\d{12}$/, "La fecha y hora (datetime) tiene que tener 12 dígitos"),
  apiKey: z.string(),
});

const curdInputSchema = baseSensorSchema
  .merge(
    z.object({
      temperature: z.number({
        required_error: "No se recibió temperatura (temperature)",
        invalid_type_error:
          "El tipo de temperatura (temperature) debe ser numérico",
      }),
    })
  )
  .strict();

const saltingInputSchema = baseSensorSchema
  .merge(
    z.object({
      salinity: z.number({
        required_error: "No se recibió salinidad (salinity)",
        invalid_type_error: "El tipo de salinidad (salinity) debe ser numérico",
      }),
    })
  )
  .strict();

const maturationInputSchema = baseSensorSchema
  .merge(
    z.object({
      temperature: z.number({
        required_error: "No se recibió temperatura (temperature)",
        invalid_type_error:
          "El tipo de temperatura (temperature) debe ser numérico",
      }),
      humidity: z.number({
        required_error: "No se recibió humedad (humidity)",
        invalid_type_error: "El tipo de humedad (humidity) debe ser numérico",
      }),
    })
  )
  .strict();

export { curdInputSchema, saltingInputSchema, maturationInputSchema };
