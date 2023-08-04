import { createTRPCRouter, publicProcedure } from "@api/trpc";
import DairyRepository from "@infrastructure/dairies/DairyRepository";
("@infrastructure/dairies/DairyRepository");
import type { IDairyRepository } from "@infrastructure/dairies/IDairyRepository";
import DairyController from "@controllers/dairies/DairyController";
import type { IDairyController } from "@controllers/dairies/IDairyController";
import { z } from "zod";
import { dairySchema, updateDairySchema } from "@schemas";
import { NotFoundError, UniqueConstraintFailedError } from "@errors";
import type { ISensorRepository } from "@infrastructure/sensors/ISensorRepository";
import SensorRepository from "@infrastructure/sensors/SensorRepository";
import type { ISensorController } from "@controllers/sensors/ISensorController";
import SensorController from "@controllers/sensors/SensorController";

export const dairiesRouter = createTRPCRouter({
  getAllDairiesWithProducerAndEmployees: publicProcedure
    .input(z.object({ includeDeleted: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const repository: IDairyRepository = new DairyRepository(ctx);
      const controller: IDairyController = new DairyController(repository);
      try {
        const dairies = await controller.getAllDairiesWithProducerAndEmployees(
          input?.includeDeleted
        );

        return { success: true, dairies };
      } catch (error) {
        console.error(
          "[Error getting all dairies with producer and employees]",
          error
        );

        return {
          success: false,
          message: "Error no reconocido, inténtalo nuevamente más tarde.",
          translationKey: "errors.default",
        };
      }
    }),

  getAllDairies: publicProcedure
    .input(z.object({ includeDeleted: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const repository: IDairyRepository = new DairyRepository(ctx);
      const controller: IDairyController = new DairyController(repository);
      try {
        const dairies = await controller.getAllDairies(input?.includeDeleted);

        return { success: true, dairies };
      } catch (error) {
        console.error("[Error getting all dairies]", error);

        return {
          success: false,
          message: "Error no reconocido, inténtalo nuevamente más tarde.",
          translationKey: "errors.default",
        };
      }
    }),

  getDairyByRut: publicProcedure
    .input(z.object({ rut: z.number() }))
    .query(async ({ ctx, input: { rut } }) => {
      try {
        const repository: IDairyRepository = new DairyRepository(ctx);
        const controller: IDairyController = new DairyController(repository);
        const dairy = await controller.getDairyByRut(rut);

        return {
          success: true,
          dairy,
        };
      } catch (error) {
        console.error("[Error getting dairy]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró la quesería",
            translationKey: "errors.dairyNotFound",
          };
        }

        return {
          success: false,
          message:
            "Error no reconocido obteniendo la quesería, inténtalo nuevamente más tarde.",
          translationKey: "errors.unrecognizedGettingDairy",
        };
      }
    }),

  getDairyCheeseTypesByRut: publicProcedure
    .input(z.object({ dairyRut: z.number() }))
    .query(async ({ ctx, input: { dairyRut } }) => {
      const repository: IDairyRepository = new DairyRepository(ctx);
      const controller: IDairyController = new DairyController(repository);
      const cheeseTypes = await controller.getDairyCheeseTypesByRut(dairyRut);

      return {
        success: true,
        cheeseTypes,
      };
    }),

  updateDairyInfo: publicProcedure
    .input(updateDairySchema)
    .mutation(async ({ ctx, input }) => {
      const repository: IDairyRepository = new DairyRepository(ctx);
      const controller: IDairyController = new DairyController(repository);
      try {
        const updatedDairy = await controller.updateDairyInfo(input);

        if (updatedDairy === false) {
          return {
            success: true,
            message: "No se encontraron cambios en la quesería",
            translationKey: "dairies.dairyNotUpdated",
          };
        }

        return {
          success: true,
          updatedDairy,
          message: "La quesería se actualizó correctamente",
          translationKey: "dairies.dairyUpdated",
        };
      } catch (error) {
        console.error("[Error updating dairy]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró la quesería",
            translationKey: "errors.dairyNotFound",
          };
        }

        return {
          success: false,
          message:
            "Ocurrió un error al intentar actualizar la quesería, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedUpdatingDairy",
        };
      }
    }),

  createDairy: publicProcedure
    .input(dairySchema)
    .mutation(async ({ ctx, input }) => {
      const repository: IDairyRepository = new DairyRepository(ctx);
      const controller: IDairyController = new DairyController(repository);
      try {
        const createdDairy = await controller.createDairy(input);
        return {
          success: true,
          createdDairy,
        };
      } catch (error) {
        console.error("[Error creating dairy]", error);

        if (error instanceof UniqueConstraintFailedError) {
          return {
            success: false,
            message:
              "Ya existe una quesería con el rut ingresado, revisa la información e inténtalo nuevamente.",
            translationKey: "errors.dairyWithRutAlreadyExists",
          };
        }

        return {
          success: false,
          message:
            "Ocurrió un error al intentar crear la quesería, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedCreatingDairy",
        };
      }
    }),

  deleteDairy: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: rut }) => {
      const repository: IDairyRepository = new DairyRepository(ctx);
      const controller: IDairyController = new DairyController(repository);

      try {
        const deletedDairy = await controller.deleteDairy(rut);

        return {
          success: true,
          deletedDairy,
        };
      } catch (error) {
        console.error("[Error deleting dairy]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró la quesería.",
            translationKey: "errors.dairyNotFound",
          };
        }

        return {
          success: false,
          message:
            "Ocurrió un error al intentar eliminar la quesería, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedDeletingDairy",
        };
      }
    }),

  restoreDairy: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: rut }) => {
      const repository: IDairyRepository = new DairyRepository(ctx);
      const controller: IDairyController = new DairyController(repository);

      try {
        const restoredDairy = await controller.restoreDairy(rut);

        return {
          success: true,
          restoredDairy,
        };
      } catch (error) {
        console.error("[Error restoring dairy]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró la quesería.",
            translationKey: "errors.dairyNotFound",
          };
        }

        return {
          success: false,
          message:
            "Ocurrió un error al intentar restaurar la quesería, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedRestoringDairy",
        };
      }
    }),

  countLastWeekSensorReadsByDairy: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input: dairyRut }) => {
      const repository: ISensorRepository = new SensorRepository(ctx);
      const controller: ISensorController = new SensorController(repository);

      try {
        const sensorReads = await controller.countLastWeekSensorReadsByDairy({
          dairyRut,
        });

        return {
          success: true,
          sensorReads,
        };
      } catch (error) {
        console.error("[Error counting sensor reads]", error);

        return {
          success: false,
          message:
            "Ocurrió un error al intentar obtener la lectura de los sensores, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedCountingSensorReads",
        };
      }
    }),

  getDairyLocationStats: publicProcedure.query(async ({ ctx }) => {
    const repository: IDairyRepository = new DairyRepository(ctx);
    const controller: IDairyController = new DairyController(repository);
    try {
      const stats = await controller.getDairyLocationStats();

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("[Error obtaining dairy location stats]", error);

      return {
        success: false,
        message:
          "Ocurrió un error al intentar obtener las estadísticas de los departamentos de las queserías, inténtalo nuevamente más tarde",
        translationKey: "errors.unrecognizedGettingDairyLocationStats",
      };
    }
  }),

  getCertificationFailsForDairy: publicProcedure
    .input(
      z.object({
        minDate: z.date(),
        maxDate: z.date(),
        rut: z.number(),
      })
    )
    .query(async ({ ctx, input: { rut, minDate, maxDate } }) => {
      const repository: IDairyRepository = new DairyRepository(ctx);
      const controller: IDairyController = new DairyController(repository);

      try {
        const failedCertifications =
          await controller.getDairyFailedCertifications(rut, minDate, maxDate);

        return {
          success: true,
          failedCertifications,
        };
      } catch (error) {
        console.error("[Error obtaining certifications failed]", error);

        return {
          success: false,
          message:
            "Ocurrió un error al intentar obtener las certificaciones rechazadas, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedGettingFailedCertifications",
        };
      }
    }),
});
