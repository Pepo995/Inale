import { ZodError } from "zod";
import { type NextApiRequest, type NextApiResponse } from "next";
import { parse } from "date-fns";
import { curdInputSchema } from "@schemas";
import SensorRepository from "@infrastructure/sensors/SensorRepository";
import SensorController from "@controllers/sensors/SensorController";
import type { ISensorRepository } from "@infrastructure/sensors/ISensorRepository";
import type { ISensorController } from "@controllers/sensors/ISensorController";
import { prisma } from "@db";
import { ForeignKeyFailedError, UniqueConstraintFailedError } from "@errors";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const { apiKey, ...input } = curdInputSchema.parse(req.body);

        /**
         * We use the field apiKey to be sure that the caller
         * is authorized by us as he received our apiKey string.
         */
        if (process.env.PUBLIC_API_KEY !== apiKey) {
          res.status(403).send({
            success: false,
            message: "Prohibido",
          });
          break;
        }

        const parsedDatetime = parse(input.datetime, "yyyyMMddHHmm", 0);

        const repository: ISensorRepository = new SensorRepository({ prisma });
        const controller: ISensorController = new SensorController(repository);
        try {
          await controller.createCurdRead({
            ...input,
            datetime: parsedDatetime,
          });
          res.status(200).send({ success: true, ...input });
          break;
        } catch (error) {
          console.error("[Error creating curd read]", error);
          if (error instanceof ForeignKeyFailedError) {
            res.status(404).send({
              success: false,
              message: `No se encontró la quesería con rut "${input.dairyRut}"`,
            });
            break;
          }
          if (error instanceof UniqueConstraintFailedError) {
            res.status(400).send({
              success: false,
              message: `Ya existe una lectura de la etapa de coagulación y cocción para la quesería con el rut "${input.dairyRut}" en la fecha y hora "${input.datetime}"`,
            });
            break;
          }
          res.status(500).send({
            success: false,
            message: "Error no reconocido guardando la lectura",
          });
          break;
        }
      } catch (error) {
        console.error(error);
        let message = "Unknown Error";
        if (error instanceof ZodError) {
          const messages: string[] = [];
          error.errors.forEach((error) => {
            console.error(
              `Error found: "${error.message}". Code "${error.code}"`
            );
            messages.push(error.message);
          });
          message = messages.join(". ");
        } else if (error instanceof Error) {
          if (error.message === "Invalid time value")
            message = "La fecha y hora (datetime) recibida es incorrecta";
          else message = error.message;
        }

        res.status(400).send({
          success: false,
          message,
        });
        break;
      }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method ?? "unknown"} Not Allowed`);
      break;
  }
};

export default handler;
