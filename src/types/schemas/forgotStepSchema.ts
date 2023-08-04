import * as z from "zod";
import { parseDateTime } from "@utils";
import {
  DateValidation,
  DateOrEmptyValidation,
  TimeValidation,
} from "./shared";
import {
  initialVolumeSchema,
  weightAfterMaturationSchema,
  weightBeforeSaltingSchema,
} from "./stepSchemas";

const now = new Date();
const isNotAfterNow = (date?: string, time?: string) =>
  !(!!date && !!time) || now >= parseDateTime(`${date} ${time}`);

const forgotStepSchema = initialVolumeSchema
  .merge(
    weightAfterMaturationSchema.merge(
      weightBeforeSaltingSchema.merge(
        z.object({
          curdInitDate: DateValidation,
          curdInitTime: TimeValidation,
          curdInProgress: z.boolean(),
          curdEndDate: DateValidation.optional(),
          curdEndTime: TimeValidation.optional(),
          betweenCurdAndSalting: z.boolean(),
          saltingInitDate: DateValidation.optional(),
          saltingInitTime: TimeValidation.optional(),
          saltingInProgress: z.boolean(),
          maturationInitDate: DateValidation.optional(),
          maturationInitTime: TimeValidation.optional(),
          maturationInProgress: z.boolean(),
          maturationEndDate: DateValidation.optional(),
          maturationEndTime: TimeValidation.optional(),
        })
      )
    )
  )
  .refine(
    (data) => {
      if (!!data.curdInitDate && !!data.curdInitTime && !data.curdInProgress) {
        return (
          data.curdEndDate &&
          data.curdEndTime &&
          data.curdEndDate.length > 0 &&
          data.curdEndTime.length > 0
        );
      }
      return true;
    },
    {
      path: ["curdEndTime"],
      message:
        "Debes completar la fecha y hora de fin de la etapa de coagulación y cocción o indicar la etapa que está en proceso",
    }
  )
  .refine(
    (data) => {
      if (
        !!data.curdEndDate &&
        !!data.curdEndTime &&
        !data.betweenCurdAndSalting
      ) {
        return (
          data.saltingInitDate &&
          data.saltingInitTime &&
          data.saltingInitDate.length > 0 &&
          data.saltingInitTime.length > 0
        );
      }
      return true;
    },
    {
      path: ["saltingInitTime"],
      message:
        "Debes completar la fecha y hora de inicio de la etapa de salmuera o indicar la etapa que está en proceso",
    }
  )
  .refine(
    (data) => {
      if (
        !!data.saltingInitDate &&
        !!data.saltingInitTime &&
        !data.saltingInProgress
      ) {
        return data.maturationInitDate && data.maturationInitTime;
      }
      return true;
    },
    {
      path: ["maturationInitTime"],
      message:
        "Debes completar la fecha y hora de inicio de la etapa de maduración o indicar la etapa que está en proceso",
    }
  )
  .refine(
    (data) => {
      if (
        !!data.maturationInitDate &&
        !!data.maturationInitTime &&
        !data.maturationInProgress
      ) {
        return data.maturationEndDate && data.maturationEndTime;
      }
      return true;
    },
    {
      path: ["maturationEndTime"],
      message:
        "Debes completar la fecha y hora de fin de la etapa de maduración o indicar la etapa que está en proceso",
    }
  )
  .refine(
    (data) => {
      if (
        !!data.curdInitDate &&
        !!data.curdInitTime &&
        !!data.curdEndDate &&
        !!data.curdEndTime
      ) {
        return (
          parseDateTime(`${data.curdInitDate} ${data.curdInitTime}`) <
          parseDateTime(`${data.curdEndDate} ${data.curdEndTime}`)
        );
      }
      return true;
    },
    {
      path: ["curdEndTime"],
      message:
        "La fecha y hora de fin de la etapa de coagulación y cocción debe ser posterior a la de inicio",
    }
  )
  .refine(
    (data) => {
      if (
        !!data.curdEndDate &&
        !!data.curdEndTime &&
        !!data.saltingInitDate &&
        !!data.saltingInitTime
      ) {
        return (
          parseDateTime(`${data.curdEndDate} ${data.curdEndTime}`) <
          parseDateTime(`${data.saltingInitDate} ${data.saltingInitTime}`)
        );
      }
      return true;
    },
    {
      path: ["saltingInitTime"],
      message:
        "La fecha y hora de inicio de la etapa de salmuera debe ser posterior a la de fin de la etapa de coagulación y cocción",
    }
  )
  .refine(
    (data) => {
      if (
        !!data.saltingInitDate &&
        !!data.saltingInitTime &&
        !!data.maturationInitDate &&
        !!data.maturationInitTime
      ) {
        return (
          parseDateTime(`${data.saltingInitDate} ${data.saltingInitTime}`) <
          parseDateTime(`${data.maturationInitDate} ${data.maturationInitTime}`)
        );
      }
      return true;
    },
    {
      path: ["maturationInitTime"],
      message:
        "La fecha y hora de inicio de la etapa de maduración debe ser posterior a la de fin de la etapa de salmuera",
    }
  )
  .refine(
    (data) => {
      if (
        !!data.maturationInitDate &&
        !!data.maturationInitTime &&
        !!data.maturationEndDate &&
        !!data.maturationEndTime
      ) {
        return (
          parseDateTime(
            `${data.maturationInitDate} ${data.maturationInitTime}`
          ) <
          parseDateTime(`${data.maturationEndDate} ${data.maturationEndTime}`)
        );
      }
      return true;
    },
    {
      path: ["maturationEndTime"],
      message:
        "La fecha y hora de fin debe ser posterior a la de inicio de la etapa de maduración",
    }
  )
  .refine((data) => isNotAfterNow(data.curdInitDate, data.curdInitTime), {
    path: ["curdInitTime"],
    message:
      "No está permitido ingresar fecha y hora posterior al momento actual",
  })
  .refine((data) => isNotAfterNow(data.saltingInitDate, data.saltingInitTime), {
    path: ["saltingInitTime"],
    message:
      "No está permitido ingresar fecha y hora posterior al momento actual",
  })
  .refine(
    (data) => isNotAfterNow(data.maturationInitDate, data.maturationInitTime),
    {
      path: ["maturationInitTime"],
      message:
        "No está permitido ingresar fecha y hora posterior al momento actual",
    }
  )
  .refine(
    (data) => isNotAfterNow(data.maturationEndDate, data.maturationEndTime),
    {
      path: ["maturationEndTime"],
      message:
        "No está permitido ingresar fecha y hora posterior al momento actual",
    }
  );

export { forgotStepSchema, DateValidation, DateOrEmptyValidation };
