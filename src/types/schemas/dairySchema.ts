import * as z from "zod";
import {
  DateOrEmptyValidation,
  NameValidation,
  PhoneValidation,
  RutValidation,
  positiveIntegerRegEx,
} from "./shared";
import { EnumDepartment } from "..";

const updateDairyFormSchema = z.object({
  companyNumber: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo")
    .nullish(),
  name: NameValidation,
  registrationCode: z.string().nullish(),
  endorsementDate: DateOrEmptyValidation.nullish(),
  bromatologicalRegistry: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo")
    .nullish(),
  dicoseNumber: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo")
    .nullish(),
  address: z.string().nullish(),
  contactPhone: PhoneValidation.nullish(),
  enabledSince: DateOrEmptyValidation.nullish(),
  department: z.nativeEnum(EnumDepartment).nullish(),
});

const employeeFormSchema = z.object({
  document: z
    .string()
    .regex(
      /^[1-9]\d{5,8}$/,
      "Debe ser un número de 6 a 9 dígitos sin puntos ni guiones"
    ),
  name: NameValidation,
});

const dairyCheeseTypeFormSchema = z.object({
  cheeseTypeName: z.string({ required_error: "El tipo de queso es requerido" }),
});

const cheeseTypeActiveSchema = z.object({
  cheeseTypeName: z.string(),
  active: z.boolean(),
});

const employeeSchema = employeeFormSchema.merge(
  z.object({
    document: z.number(),
    dairyRut: z.number(),
  })
);

const dairyCheeseTypeSchema = cheeseTypeActiveSchema.merge(
  z.object({
    dairyRut: z.number(),
  })
);

const createDairyFormSchema = updateDairyFormSchema.merge(
  z.object({
    rut: RutValidation,
    producerName: NameValidation,
  })
);

const updateCheeseTypePageSchema = z.object({
  minCurdTemperature: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  maxCurdTemperature: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  minCurdMinutes: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  maxCurdMinutes: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),

  minSaltingSalinity: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  maxSaltingSalinity: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  minSaltingMinutes: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  maxSaltingMinutes: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),

  minMaturationTemperature: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  maxMaturationTemperature: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  minMaturationHumidity: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  maxMaturationHumidity: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  minMaturationMinutes: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),
  maxMaturationMinutes: z
    .string()
    .regex(positiveIntegerRegEx, "Debe ser un número positivo"),

  registrationCode: z.string().optional(),
  bromatologicalForm: z.string().optional(),
});

const createCheeseTypePageSchema = updateCheeseTypePageSchema.merge(
  z.object({
    name: NameValidation,
  })
);

const cheeseTypePageValidator = createCheeseTypePageSchema
  .refine(
    (cheeseType) =>
      parseInt(cheeseType.minCurdTemperature) <=
      parseInt(cheeseType.maxCurdTemperature),
    {
      path: ["maxCurdTemperature"],
      message: "La temperatura máxima no puede ser menor que la mínima",
    }
  )
  .refine(
    (cheeseType) =>
      parseInt(cheeseType.minCurdMinutes) <=
      parseInt(cheeseType.maxCurdMinutes),
    {
      path: ["maxCurdMinutes"],
      message: "El tiempo máximo no puede ser menor que el mínimo",
    }
  )
  .refine(
    (cheeseType) =>
      parseInt(cheeseType.minSaltingSalinity) <=
      parseInt(cheeseType.maxSaltingSalinity),
    {
      path: ["maxSaltingSalinity"],
      message: "La salinidad máxima no puede ser menor que la mínima",
    }
  )
  .refine(
    (cheeseType) =>
      parseInt(cheeseType.minSaltingMinutes) <=
      parseInt(cheeseType.maxSaltingMinutes),
    {
      path: ["maxSaltingMinutes"],
      message: "El tiempo máximo no puede ser menor que el mínimo",
    }
  )
  .refine(
    (cheeseType) =>
      parseInt(cheeseType.minMaturationTemperature) <=
      parseInt(cheeseType.maxMaturationTemperature),
    {
      path: ["maxMaturationTemperature"],
      message: "La temperatura máxima no puede ser menor que la mínima",
    }
  )
  .refine(
    (cheeseType) =>
      parseInt(cheeseType.minMaturationHumidity) <=
      parseInt(cheeseType.maxMaturationHumidity),
    {
      path: ["maxMaturationHumidity"],
      message: "La humedad máxima no puede ser menor que la mínima",
    }
  )
  .refine(
    (cheeseType) =>
      parseInt(cheeseType.minMaturationMinutes) <=
      parseInt(cheeseType.maxMaturationMinutes),
    {
      path: ["maxMaturationMinutes"],
      message: "El tiempo máximo no puede ser menor que el mínimo",
    }
  );

const cheeseTypeSchema = z.object({
  minCurdTemperature: z.number(),
  maxCurdTemperature: z.number(),
  minCurdMinutes: z.number(),
  maxCurdMinutes: z.number(),
  minSaltingSalinity: z.number(),
  maxSaltingSalinity: z.number(),
  minSaltingMinutes: z.number(),
  maxSaltingMinutes: z.number(),
  minMaturationTemperature: z.number(),
  maxMaturationTemperature: z.number(),
  minMaturationHumidity: z.number(),
  maxMaturationHumidity: z.number(),
  minMaturationMinutes: z.number(),
  maxMaturationMinutes: z.number(),
  registrationCode: z.string().optional(),
  bromatologicalForm: z.string().optional(),
  name: NameValidation,
});
const updateDairySchema = updateDairyFormSchema.merge(
  z.object({
    rut: z.number(),
    companyNumber: z.number().nullable(),
    bromatologicalRegistry: z.number().nullable(),
    dicoseNumber: z.number().nullable(),
    endorsementDate: z.date().nullable(),
    enabledSince: z.date().nullable(),
    employees: z.array(employeeSchema),
    cheeseTypes: z.array(dairyCheeseTypeSchema),
    department: z.nativeEnum(EnumDepartment).nullable(),
  })
);

const dairySchema = updateDairySchema.merge(
  z.object({
    producerName: z.string(),
  })
);

export {
  employeeFormSchema,
  dairySchema,
  updateDairySchema,
  updateDairyFormSchema,
  createDairyFormSchema,
  updateCheeseTypePageSchema,
  createCheeseTypePageSchema,
  cheeseTypePageValidator,
  dairyCheeseTypeFormSchema,
  cheeseTypeActiveSchema,
  cheeseTypeSchema,
};
