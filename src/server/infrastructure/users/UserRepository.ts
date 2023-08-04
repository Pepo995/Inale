import { NotFoundError } from "@errors";
import type { IUserRepository } from "./IUserRepository";
import type { Context } from "@types";

export default class UserRepository implements IUserRepository {
  private ctx;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  /**
   * @throws NotFoundError
   */
  getUserByMail: IUserRepository["getUserByMail"] = async (
    userEmail: string
  ) => {
    const user = await this.ctx.prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!user)
      throw new NotFoundError(`User with email ${userEmail} not found`, "USER");

    return user;
  };

  upsertUserByMail: IUserRepository["upsertUserByMail"] = async (user) =>
    await this.ctx.prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        isAdmin: true,
      },
      create: {
        email: user.email,
        isAdmin: true,
      },
    });
}
