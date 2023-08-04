import { createTRPCRouter, publicProcedure } from "@api/trpc";
import { z } from "zod";
import BatchRepository from "@infrastructure/batches/BatchRepository";
import type { IBatchRepository } from "@infrastructure/batches/IBatchRepository";
import BatchController from "@controllers/batches/BatchController";
import type { IBatchController } from "@controllers/batches/IBatchController";
import TokenController from "@controllers/tokens/TokenController";
import type IGetTokenByBatchId from "@controllers/tokens/IGetTokenByBatchId";
import type IGetBatchIdByToken from "@controllers/tokens/IGetBatchIdByToken";
import { type IDairyRepository } from "@infrastructure/dairies/IDairyRepository";
import DairyRepository from "@infrastructure/dairies/DairyRepository";
import { BlockchainError, ConsistencyError, NotFoundError } from "@errors";
import { type ISensorRepository } from "@infrastructure/sensors/ISensorRepository";
import SensorRepository from "@infrastructure/sensors/SensorRepository";
import { type ICheeseTypeRepository } from "@infrastructure/cheeseTypes/ICheeseTypeRepository";
import CheeseTypeRepository from "@infrastructure/cheeseTypes/CheeseTypeRepository";
import { createBatchesSchema } from "@schemas";
import { getBaseUrl } from "@utils";
import { type IBlockchainRepository } from "@infrastructure/blockchain/IBlockchainRepository";
import FakeBlockchainRepository from "@infrastructure/blockchain/FakeBlockchainRepository";

export const batchesRouter = createTRPCRouter({
  getBatchByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input: { token } }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const batchIdGetter: IGetBatchIdByToken = new TokenController();
      const blockchainRepository: IBlockchainRepository =
        new FakeBlockchainRepository(ctx);
      const controller: IBatchController = new BatchController({
        batchRepository,
        batchIdGetter,
        blockchainRepository,
      });
      try {
        const batch = await controller.getBatchByToken(token);
        return { success: true, batch };
      } catch (error) {
        console.error("Error getting batch by token", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el lote",
            translationKey: "errors.batchNotFound",
          };
        }

        return { success: false };
      }
    }),

  getBatchById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input: { id } }) => {
      try {
        const batchRepository: IBatchRepository = new BatchRepository(ctx);
        const blockchainRepository: IBlockchainRepository =
          new FakeBlockchainRepository(ctx);
        const controller: IBatchController = new BatchController({
          batchRepository,
          blockchainRepository,
        });
        const batch = await controller.getBatchById(id);
        return {
          success: true,
          batch,
        };
      } catch (error) {
        console.error("[Error getting batch]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el lote",
            translationKey: "errors.batchNotFound",
          };
        }

        if (error instanceof ConsistencyError) {
          return {
            success: false,
            message:
              "No se encontró mensaje de certificación para este lote. Refresca la página y vuelve a intentarlo o comunícate con nosotros si no se resuelve.",
            translationKey: "errors.cannotFindCertificateMessage",
          };
        }

        return {
          success: false,
          message:
            "Error no reconocido obteniendo el lote, inténtalo nuevamente más tarde.",
          translationKey: "errors.unrecognizedGettingBatch",
        };
      }
    }),

  startBatch: publicProcedure
    .input(
      z.object({
        batchId: z.string(),
        cheeseTypeName: z.string(),
        batchName: z.string().optional(),
      })
    )
    .mutation(
      async ({ ctx, input: { batchId, cheeseTypeName, batchName } }) => {
        const batchRepository: IBatchRepository = new BatchRepository(ctx);
        const controller: IBatchController = new BatchController({
          batchRepository,
        });
        try {
          const batch = await controller.startBatch(
            batchId,
            cheeseTypeName,
            batchName
          );
          return { success: true, batch };
        } catch (error) {
          console.error("[Error starting batch]", error);

          if (error instanceof NotFoundError) {
            return {
              success: false,
              message: "No se encontró el lote",
              translationKey: "errors.batchNotFound",
            };
          }

          return {
            success: false,
            message:
              "Ocurrió un error al intentar iniciar el lote, por favor reintente más tarde",
            translationKey: "errors.unrecognizedStartingBatch",
          };
        }
      }
    ),

  startCurd: publicProcedure
    .input(
      z.object({ batchId: z.string(), initialVolume: z.number().optional() })
    )
    .mutation(async ({ ctx, input: { batchId, initialVolume } }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const controller: IBatchController = new BatchController({
        batchRepository,
      });
      try {
        const batch = await controller.startCurd(batchId, initialVolume);
        return { success: true, batch };
      } catch (error) {
        console.error("[Error starting curd]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el lote",
            translationKey: "errors.batchNotFound",
          };
        }

        return {
          success: false,
          message: "No se pudo iniciar la etapa de coagulación y cocción",
        };
      }
    }),

  finishCurd: publicProcedure
    .input(z.object({ batchId: z.string() }))
    .mutation(async ({ ctx, input: { batchId } }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const controller: IBatchController = new BatchController({
        batchRepository,
      });
      try {
        const batch = await controller.finishCurd(batchId);
        return { success: true, batch };
      } catch (error) {
        console.error("[Error finishing curd]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el lote",
            translationKey: "errors.batchNotFound",
          };
        }

        return {
          success: false,
          message: "No se pudo finalizar la etapa de coagulación y cocción",
        };
      }
    }),

  startSalting: publicProcedure
    .input(
      z.object({
        batchId: z.string(),
        weightBeforeSalting: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input: { batchId, weightBeforeSalting } }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const controller: IBatchController = new BatchController({
        batchRepository,
      });
      try {
        const batch = await controller.startSalting(
          batchId,
          weightBeforeSalting
        );
        return { success: true, batch };
      } catch (error) {
        console.error("[Error starting salting]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el lote",
            translationKey: "errors.batchNotFound",
          };
        }

        return {
          success: false,
          message: "No se pudo iniciar la etapa de salmuera",
        };
      }
    }),

  startMaturation: publicProcedure
    .input(z.object({ batchId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const controller: IBatchController = new BatchController({
        batchRepository,
      });
      try {
        const batch = await controller.startMaturation(input.batchId);
        return { success: true, batch };
      } catch (error) {
        console.error("[Error starting maturation]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el lote",
            translationKey: "errors.batchNotFound",
          };
        }

        return {
          success: false,
          message: "No se pudo iniciar la etapa de maduración",
        };
      }
    }),

  finishBatch: publicProcedure
    .input(
      z.object({
        batchId: z.string(),
        weightAfterMaturation: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input: { batchId, weightAfterMaturation } }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const sensorRepository: ISensorRepository = new SensorRepository(ctx);
      const cheeseTypeRepository: ICheeseTypeRepository =
        new CheeseTypeRepository(ctx);
      const blockchainRepository: IBlockchainRepository =
        new FakeBlockchainRepository(ctx);
      const controller: IBatchController = new BatchController({
        batchRepository,
        sensorRepository,
        cheeseTypeRepository,
        blockchainRepository,
      });

      try {
        const batch = await controller.finishBatch(
          batchId,
          weightAfterMaturation
        );
        return { success: true, batch };
      } catch (error) {
        console.error("[Error finishing batch]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: `Hubo un error, no se encontró ${
              error.type === "CHEESE_TYPE" ? "el tipo de queso" : "el lote"
            }. Refresca la página y vuelve a intentarlo o comunícate con nosotros si no se resuelve.`,
            translationKey:
              error.type === "CHEESE_TYPE"
                ? "errors.cheeseTypeNotFound"
                : "errors.batchNotFound",
          };
        }

        if (error instanceof ConsistencyError) {
          return {
            success: false,
            message:
              "No se pudo finalizar el lote, recarga la página e inténtalo nuevamente.",
            translationKey: "errors.batchCannotBeFinished",
          };
        }

        if (error instanceof BlockchainError) {
          return {
            success: false,
            message:
              "No se pudo finalizar el lote, ya que hubo un error guardando la información, inténtalo nuevamente más tarde.",
            translationKey: "errors.batchInfoCannotBeStored",
          };
        }

        return {
          success: false,
          message:
            "Error no reconocido finalizando el lote, inténtalo nuevamente más tarde.",
          translationKey: "errors.unrecognizedGettingBatch",
        };
      }
    }),

  createBatches: publicProcedure
    .input(createBatchesSchema)
    .mutation(async ({ ctx, input: { batches } }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const dairyRepository: IDairyRepository = new DairyRepository(ctx);
      const tokenGetter: IGetTokenByBatchId = new TokenController();
      const controller: IBatchController = new BatchController({
        batchRepository,
        tokenObtainer: tokenGetter,
        dairyRepository,
      });

      try {
        const createdBatches = await controller.createBatches(
          batches,
          getBaseUrl(ctx.req)
        );
        return {
          success: true,
          createdBatches,
        };
      } catch (error) {
        console.error("[Error creating batches]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: `Hubo un error, no se encontró ${
              error.type === "CHEESE_TYPE"
                ? "tipo de queso para la quesería. Asóciale un tipo de queso y vuelve a intentarlo"
                : "la quesería, comunícate con nosotros"
            }.`,
            translationKey:
              error.type === "CHEESE_TYPE"
                ? "errors.dairyWithoutCheeseType"
                : "errors.dairyNotFound",
          };
        }

        return {
          sucess: false,
          message: "Hubo un error, intenta nuevamente",
          translationKey: "errors.default",
        };
      }
    }),

  updateBatchSteps: publicProcedure
    .input(
      z.object({
        batchId: z.string(),
        initialVolume: z.number().optional(),
        curdInitDateTime: z.date().optional(),
        curdEndDateTime: z.date().optional(),
        weightBeforeSalting: z.number().optional(),
        saltingInitDateTime: z.date().optional(),
        maturationInitDateTime: z.date().optional(),
        maturationEndDateTime: z.date().optional(),
        weightAfterMaturation: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const sensorRepository: ISensorRepository = new SensorRepository(ctx);
      const cheeseTypeRepository: ICheeseTypeRepository =
        new CheeseTypeRepository(ctx);
      const blockchainRepository: IBlockchainRepository =
        new FakeBlockchainRepository(ctx);

      const controller: IBatchController = new BatchController({
        batchRepository,
        sensorRepository,
        cheeseTypeRepository,
        blockchainRepository,
      });

      try {
        const updatedBatch = await controller.updateSteps(input);
        return {
          success: true,
          updatedBatch,
        };
      } catch (error) {
        console.error("[Error updating batch steps]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message:
              "Hubo un error, el lote no se encontró. Comunícate con nosotros.",
            translationKey: "errors.batchNotFound",
          };
        }

        if (error instanceof BlockchainError) {
          return {
            success: false,
            message:
              "No se pudo finalizar el lote, ya que hubo un error guardando la información, inténtalo nuevamente más tarde.",
            translationKey: "errors.batchInfoCannotBeStored",
          };
        }

        return {
          sucess: false,
          message: "Hubo un error, intenta nuevamente",
          translationKey: "errors.default",
        };
      }
    }),

  getBatchSensorReads: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input: { id } }) => {
      try {
        const batchRepository: IBatchRepository = new BatchRepository(ctx);
        const sensorRepository: ISensorRepository = new SensorRepository(ctx);
        const cheeseTypeRepository: ICheeseTypeRepository =
          new CheeseTypeRepository(ctx);
        const controller: IBatchController = new BatchController({
          batchRepository,
          sensorRepository,
          cheeseTypeRepository,
        });
        const batchSensorData = await controller.getBatchSensorDataById(id);
        return {
          success: true,
          batchSensorData,
        };
      } catch (error) {
        console.error("[Error getting sensor reads for batch]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: `No se encontró el ${
              error.type === "CHEESE_TYPE" ? "tipo de queso" : "lote"
            }`,
            translationKey:
              error.type === "CHEESE_TYPE"
                ? "errors.cheeseTypeNotFound"
                : "errors.batchNotFound",
          };
        }

        return {
          success: false,
          message:
            "Error no reconocido obteniendo la información de los sensores para este lote, inténtalo nuevamente más tarde.",
          translationKey: "errors.unrecognizedGettingSensorsData",
        };
      }
    }),

  getBatchesByDateRange: publicProcedure
    .input(
      z.object({
        minDate: z.date(),
        maxDate: z.date(),
        filter: z.string().optional(),
        pagination: z
          .object({
            pageSize: z.number(),
            page: z.number(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const batchRepository: IBatchRepository = new BatchRepository(ctx);
      const controller: IBatchController = new BatchController({
        batchRepository,
      });
      try {
        const batchesInfo = await controller.getBatchesByDateRange(input);
        return { success: true, batchesInfo };
      } catch (error) {
        console.error("[Error getting batches by date range]", error);

        if (error instanceof ConsistencyError) {
          return {
            success: false,
            message: "La fecha de comienzo debe ser previa a la fecha de fin",
            translationKey: "errors.consistencyErrorGettingBatchesByDate",
          };
        }

        return {
          success: false,
          message:
            "Error no reconocido obteniendo los lotes, inténtalo nuevamente más tarde.",
          translationKey: "errors.unrecognizedGettingBatches",
        };
      }
    }),

  getBatchesStats: publicProcedure.query(async ({ ctx }) => {
    const batchRepository: IBatchRepository = new BatchRepository(ctx);
    const controller: IBatchController = new BatchController({
      batchRepository,
    });

    try {
      const stats = await controller.getBatchesStats();

      return { success: true, stats };
    } catch (error) {
      return {
        success: false,
        message:
          "Error no reconocido obteniendo estadísticas, inténtalo nuevamente más tarde.",
        translationKey: "errors.unrecognizedGettingStats",
      };
    }
  }),

  getBatchesPerMonth: publicProcedure.query(async ({ ctx }) => {
    const batchRepository: IBatchRepository = new BatchRepository(ctx);
    const controller: IBatchController = new BatchController({
      batchRepository,
    });

    try {
      const batches = await controller.getBatchesPerMonth();

      return { success: true, batches };
    } catch (error) {
      return {
        success: false,
        message:
          "Error no reconocido obteniendo los lotes, inténtalo nuevamente más tarde.",
        translationKey: "errors.unrecognizedGettingBatches",
      };
    }
  }),

  getCheeseTypesWeightStats: publicProcedure.query(async ({ ctx }) => {
    const batchRepository: IBatchRepository = new BatchRepository(ctx);
    const controller: IBatchController = new BatchController({
      batchRepository,
    });

    try {
      const weightStats = await controller.getCheeseTypesWeightStats();

      return { success: true, weightStats };
    } catch (error) {
      return {
        success: false,
        message:
          "Error no reconocido obteniendo estadísticas, inténtalo nuevamente más tarde.",
        translationKey: "errors.unrecognizedGettingStats",
      };
    }
  }),
});
