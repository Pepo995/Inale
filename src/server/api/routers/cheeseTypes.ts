import { createTRPCRouter, publicProcedure } from "@api/trpc";
import type { ICheeseTypeRepository } from "@infrastructure/cheeseTypes/ICheeseTypeRepository";
import type { ICheeseTypeController } from "@controllers/cheeseTypes/ICheeseTypeController";
import CheeseTypeRepository from "@infrastructure/cheeseTypes/CheeseTypeRepository";
import CheeseTypeController from "@controllers/cheeseTypes/CheeseTypeController";
import { cheeseTypeSchema } from "@schemas";
import { NotFoundError, UniqueConstraintFailedError } from "@errors";
import { z } from "zod";

export const cheeseTypesRouter = createTRPCRouter({
  getAllCheeseTypes: publicProcedure
    .input(z.object({ includeDeleted: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const repository: ICheeseTypeRepository = new CheeseTypeRepository(ctx);
      const controller: ICheeseTypeController = new CheeseTypeController(
        repository
      );

      try {
        const allCheeseTypes = await controller.getAllCheeseTypes(
          input?.includeDeleted
        );

        return {
          success: true,
          allCheeseTypes,
        };
      } catch (error) {
        console.error("[Error getting all cheese types]", error);

        return {
          success: false,
          message: "No se pudieron cargar los tipos de queso",
          translationKey: "errors.unrecognizedGettingCheeseType",
        };
      }
    }),

  getCheeseType: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input: { name } }) => {
      const repository: ICheeseTypeRepository = new CheeseTypeRepository(ctx);
      const controller: ICheeseTypeController = new CheeseTypeController(
        repository
      );

      try {
        const cheeseType = await controller.getCheeseType(name);

        return {
          success: true,
          cheeseType,
        };
      } catch (error) {
        console.error("[Error getting cheese types]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el tipo de queso.",
            translationKey: "errors.cheeseTypeNotFound",
          };
        }

        return {
          success: false,
          message: "No se pudo cargar el tipo de queso",
          translationKey: "errors.unrecognizedGettingCheeseType",
        };
      }
    }),

  createCheeseType: publicProcedure
    .input(cheeseTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const repository: ICheeseTypeRepository = new CheeseTypeRepository(ctx);
      const controller: ICheeseTypeController = new CheeseTypeController(
        repository
      );

      try {
        const cheeseType = await controller.createCheeseType(input);

        return {
          success: true,
          cheeseType,
        };
      } catch (error) {
        console.error("[Error creating cheeseType]", error);

        if (error instanceof UniqueConstraintFailedError) {
          return {
            success: false,
            message:
              "Ya existe un tipo de queso con el nombre ingresado, revisa la información e inténtalo nuevamente.",
            translationKey: "errors.cheeseTypeWithNameAlreadyExists",
          };
        }

        return {
          success: false,
          message:
            "Ocurrió un error al intentar crear el tipo de queso, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedCreatingCheeseType",
        };
      }
    }),

  updateCheeseType: publicProcedure
    .input(cheeseTypeSchema)
    .mutation(async ({ ctx, input }) => {
      const repository: ICheeseTypeRepository = new CheeseTypeRepository(ctx);
      const controller: ICheeseTypeController = new CheeseTypeController(
        repository
      );
      try {
        const cheeseType = await controller.updateCheeseType(input);

        return {
          success: true,
          cheeseType,
        };
      } catch (error) {
        console.error("[Error updating cheeseType]", error);

        return {
          success: false,
          message:
            "Ocurrió un error al intentar actualizar el tipo de queso, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedUpdatingCheeseType",
        };
      }
    }),

  deleteCheeseType: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: name }) => {
      const repository: ICheeseTypeRepository = new CheeseTypeRepository(ctx);
      const controller: ICheeseTypeController = new CheeseTypeController(
        repository
      );
      try {
        const deletedCheeseType = await controller.deleteCheeseType(name);

        return {
          success: true,
          deletedCheeseType,
        };
      } catch (error) {
        console.error("[Error deleting cheeseType]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el tipo de queso.",
            translationKey: "errors.cheeseTypeNotFound",
          };
        }

        return {
          success: false,
          message:
            "Ocurrió un error al intentar eliminar el tipo de queso, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedDeletingCheeseType",
        };
      }
    }),

  restoreCheeseType: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: name }) => {
      const repository: ICheeseTypeRepository = new CheeseTypeRepository(ctx);
      const controller: ICheeseTypeController = new CheeseTypeController(
        repository
      );
      try {
        const restoredCheeseType = await controller.restoreCheeseType(name);

        return {
          success: true,
          restoredCheeseType,
        };
      } catch (error) {
        console.error("[Error restoring cheeseType]", error);

        if (error instanceof NotFoundError) {
          return {
            success: false,
            message: "No se encontró el tipo de queso.",
            translationKey: "errors.cheeseTypeNotFound",
          };
        }

        return {
          success: false,
          message:
            "Ocurrió un error al intentar restaurar el tipo de queso, inténtalo nuevamente más tarde",
          translationKey: "errors.unrecognizedRestoringCheeseType",
        };
      }
    }),
});
