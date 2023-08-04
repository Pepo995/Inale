import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@api/trpc";
import UserController from "@controllers/users/UserController";
import { type IUserController } from "@controllers/users/IUserController";
import UserRepository from "@infrastructure/users/UserRepository";
import { type IUserRepository } from "@infrastructure/users/IUserRepository";
import { AlreadyAdminError } from "@errors";

export const usersRouter = createTRPCRouter({
  isUserAdmin: publicProcedure
    .input(z.object({ userEmail: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.userEmail) {
        return {
          sucess: false,
          message: "Hubo un error, intenta nuevamente",
        };
      }

      const repository: IUserRepository = new UserRepository(ctx);
      const controller: IUserController = new UserController(repository);
      try {
        const isAdmin = await controller.isUserAdmin(input.userEmail);

        return {
          success: true,
          isAdmin,
        };
      } catch (error) {
        console.error("[Error verifying user]", error);

        return {
          sucess: false,
          message: "Hubo un error, intenta nuevamente",
        };
      }
    }),

  addNewAdmin: publicProcedure
    .input(z.object({ userEmail: z.string() }))
    .mutation(async ({ ctx, input: { userEmail } }) => {
      const repository: IUserRepository = new UserRepository(ctx);
      const controller: IUserController = new UserController(repository);
      try {
        await controller.addNewAdmin(userEmail);

        return { success: true };
      } catch (error) {
        console.error("[Error adding admin user]", error);

        if (error instanceof AlreadyAdminError) {
          return {
            success: false,
            message: "El usuario ya fue invitado.",
            translationKey: "errors.userAlreadyInvited",
          };
        }

        return {
          sucess: false,
          message: "Hubo un error, intenta nuevamente",
        };
      }
    }),
});
