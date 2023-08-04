import { Prisma, type PrismaClient } from "@prisma/client";
import { type ICheeseTypeRepository } from "./ICheeseTypeRepository";
import { convertCheeseTypeToOutside } from "../converters";
import type { CheeseType } from "@types";
import {
  DatabaseError,
  NotFoundError,
  PrismaErrorCodes,
  UniqueConstraintFailedError,
} from "@errors";

class CheeseTypeRepository implements ICheeseTypeRepository {
  private ctx;
  constructor(ctx: {
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
  }) {
    this.ctx = ctx;
  }

  getAllCheeseTypes: ICheeseTypeRepository["getAllCheeseTypes"] = async (
    includeDeleted
  ) =>
    (
      await this.ctx.prisma.cheeseType.findMany({
        where: { deleted: includeDeleted ? undefined : null },
      })
    ).map((cheeseType) => convertCheeseTypeToOutside(cheeseType));

  /**
   * @throws NotFoundError
   */
  getCheeseType: ICheeseTypeRepository["getCheeseType"] = async (name) => {
    const cheeseType = await this.ctx.prisma.cheeseType.findUnique({
      where: { name },
    });

    if (!cheeseType)
      throw new NotFoundError("Cheese type not found", "CHEESE_TYPE");

    return convertCheeseTypeToOutside(cheeseType);
  };

  /**
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createCheeseType: ICheeseTypeRepository["createCheeseType"] = async (
    cheeseType: CheeseType
  ) => {
    try {
      return convertCheeseTypeToOutside(
        await this.ctx.prisma.cheeseType.create({
          data: cheeseType,
        })
      );
    } catch (error) {
      console.error("[Error creating cheeseType]", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
          throw new UniqueConstraintFailedError(
            "There is a unique constraint violation, a new cheese type cannot be created with this name"
          );
        }
      }

      throw new DatabaseError("Error creating dairy");
    }
  };

  updateCheeseType: ICheeseTypeRepository["updateCheeseType"] = async (
    cheeseType: CheeseType
  ) => {
    const { name, ...data } = cheeseType;
    return convertCheeseTypeToOutside(
      await this.ctx.prisma.cheeseType.update({
        where: { name },
        data,
      })
    );
  };

  /**
   * @throws NotFoundError
   */
  deleteCheeseType: ICheeseTypeRepository["deleteCheeseType"] = async (
    name
  ) => {
    const cheeseType = await this.ctx.prisma.cheeseType.delete({
      where: { name },
    });

    if (!cheeseType)
      throw new NotFoundError("Cheese type not found", "CHEESE_TYPE");

    return convertCheeseTypeToOutside(cheeseType);
  };

  /**
   * @throws NotFoundError
   */
  restoreCheeseType: ICheeseTypeRepository["restoreCheeseType"] = async (
    name
  ) => {
    const cheeseType = await this.ctx.prisma.cheeseType.update({
      data: { deleted: null },
      where: { name },
    });

    if (!cheeseType)
      throw new NotFoundError("Cheese type not found", "CHEESE_TYPE");

    return convertCheeseTypeToOutside(cheeseType);
  };
}

export default CheeseTypeRepository;
