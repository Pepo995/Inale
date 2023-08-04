import { DatabaseError, NotFoundError } from "@errors";
import {
  convertBatchToOutside,
  convertDairyCheeseTypeToOutside,
  convertDairyToOutside,
} from "../converters";
import { type IBatchRepository } from "./IBatchRepository";
import type { Prisma, PrismaClient } from "@prisma/client";

class BatchRepository implements IBatchRepository {
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
  createBatches: IBatchRepository["createBatches"] = async ({
    dairyRut,
    cheeseTypeName,
    amount,
  }) => {
    const batches = Array.from({ length: amount }, (_, index) => index);
    const batchesId = await this.ctx.prisma.$transaction(
      batches.map((_) =>
        this.ctx.prisma.batch.create({
          data: { dairyRut, cheeseTypeName },
          select: {
            id: true,
          },
        })
      )
    );

    return batchesId;
  };

  /**
   * @throws NotFoundError
   */
  getCheeseTypeByDairyRut: IBatchRepository["getCheeseTypeByDairyRut"] = async (
    dairyRut: number
  ) => {
    const dairy = await this.ctx.prisma.dairy.findUnique({
      where: {
        rut: dairyRut,
      },
      select: {
        cheeseTypes: true,
      },
    });

    const cheeseTypeName = dairy?.cheeseTypes[0]?.cheeseTypeName;
    if (!cheeseTypeName)
      throw new NotFoundError("No cheeseType was found", "CHEESE_TYPE");
    return cheeseTypeName;
  };

  /**
   * @throws NotFoundError
   */
  getBatchById: IBatchRepository["getBatchById"] = async (batchId: string) => {
    const data = await this.ctx.prisma.batch.findUnique({
      where: { id: batchId },
      include: { dairyCheeseType: { include: { dairy: true } } },
    });

    if (!data) throw new NotFoundError("Batch not found", "BATCH");

    const {
      dairyCheeseType: { dairy, ...dairyCheeseType },
      ...batch
    } = data;

    return {
      ...convertBatchToOutside(batch),
      dairyCheeseType: convertDairyCheeseTypeToOutside(dairyCheeseType),
      dairy: convertDairyToOutside(dairy),
    };
  };

  /**
   * @throws DatabaseError
   */
  updateBatch: IBatchRepository["updateBatch"] = async (input) => {
    const { batchId, certificationMessages, ...data } = input;

    try {
      const result = await this.ctx.prisma.batch.update({
        where: { id: batchId },
        data: {
          ...data,
          certificationMessage: JSON.stringify(certificationMessages) ?? null,
        },
        include: { dairyCheeseType: { include: { dairy: true } } },
      });

      const {
        dairyCheeseType: { dairy, ...dairyCheeseType },
        ...batch
      } = result;

      return {
        ...convertBatchToOutside(batch),
        dairyCheeseType: convertDairyCheeseTypeToOutside(dairyCheeseType),
        dairy: convertDairyToOutside(dairy),
      };
    } catch (error) {
      console.error("[Error updating batch]", error);

      throw new DatabaseError("Error updating batch");
    }
  };

  /**
   * @throws DatabaseError
   */
  getBatchesByDateRange: IBatchRepository["getBatchesByDateRange"] = async ({
    minDate,
    maxDate,
    filter,
    pagination,
  }) => {
    try {
      const batches = await this.ctx.prisma.batch.findMany({
        skip: pagination ? pagination.page * pagination.pageSize : undefined,
        take: pagination ? pagination.pageSize : undefined,
        orderBy: {
          curdInitDateTime: "desc",
        },
        where: {
          OR: [
            {
              dairyCheeseType: {
                dairy: {
                  name: {
                    contains: filter,
                  },
                },
              },
            },
            {
              dairyCheeseType: {
                cheeseTypeName: {
                  contains: filter,
                },
              },
            },
            {
              batchName: {
                contains: filter,
              },
            },
          ],
          curdInitDateTime: {
            lte: maxDate,
            gte: minDate,
          },
        },
        include: {
          dairyCheeseType: {
            include: {
              dairy: true,
            },
          },
        },
      });

      let total = batches ? batches.length : 0;
      if (pagination && total != 0) {
        total = await this.ctx.prisma.batch.count({
          where: {
            OR: [
              {
                dairyCheeseType: {
                  dairy: {
                    name: {
                      contains: filter,
                    },
                  },
                },
              },
              {
                dairyCheeseType: {
                  cheeseTypeName: {
                    contains: filter,
                  },
                },
              },
              {
                batchName: {
                  contains: filter,
                },
              },
            ],
            curdInitDateTime: {
              lte: maxDate,
              gte: minDate,
            },
          },
        });
      }

      return {
        batches: batches.map((batchData) => {
          const {
            dairyCheeseType: { dairy, ...dairyCheeseType },
            ...batch
          } = batchData;

          return {
            ...convertBatchToOutside(batch),
            dairyCheeseType: convertDairyCheeseTypeToOutside(dairyCheeseType),
            dairy: convertDairyToOutside(dairy),
          };
        }),
        total,
      };
    } catch (error) {
      console.error("Error getting batches by date range", error);

      throw new DatabaseError("Error getting batches by date range");
    }
  };

  /**
   * @throws DatabaseError
   */
  getBatchesStats: IBatchRepository["getBatchesStats"] = async () => {
    try {
      const batchesStats = await this.ctx.prisma.batch.groupBy({
        by: ["certified"],
        _count: {
          started: true,
        },
      });

      return {
        batchesCertified:
          batchesStats.find(
            (batch) => batch.certified === "SuccessfullyCertified"
          )?._count?.started || 0,
        batchesFailed:
          batchesStats.find(
            (batch) => batch.certified === "CertificationFailed"
          )?._count?.started || 0,
        batchesInProcess:
          batchesStats.find((batch) => batch.certified === "WaitingReview")
            ?._count?.started || 0,
      };
    } catch (error) {
      console.error("Error getting batches stats", error);

      throw new DatabaseError("Error getting batches stats");
    }
  };

  /**
   * @throws DatabaseError
   */
  getCheeseTypesWeightStats: IBatchRepository["getCheeseTypesWeightStats"] =
    async () => {
      try {
        const avgInitialVolume = await this.ctx.prisma.batch.groupBy({
          by: ["cheeseTypeName"],
          _avg: {
            initialVolume: true,
          },
          where: {
            initialVolume: {
              gt: 0,
            },
          },
        });

        const avgWeightAfterPress = await this.ctx.prisma.batch.groupBy({
          by: ["cheeseTypeName"],
          _avg: {
            weightBeforeSalting: true,
          },
          where: {
            weightBeforeSalting: {
              gt: 0,
            },
          },
        });

        const avgFinalWeight = await this.ctx.prisma.batch.groupBy({
          by: ["cheeseTypeName"],
          _avg: {
            weightAfterMaturation: true,
          },
          where: {
            weightAfterMaturation: {
              gt: 0,
            },
          },
        });

        // Group for each cheese type its average initial volume, weight after press and final weight values
        const cheeseTypeWeightStats = avgInitialVolume.map((cheeseType) => {
          const cheeseTypeAvgWeightAfterPress = avgWeightAfterPress.find(
            (weightAfterPress) =>
              weightAfterPress.cheeseTypeName === cheeseType.cheeseTypeName
          );

          const cheeseTypeAvgFinalWeight = avgFinalWeight.find(
            (finalWeight) =>
              finalWeight.cheeseTypeName === cheeseType.cheeseTypeName
          );

          return {
            cheeseType: cheeseType.cheeseTypeName,
            avgInitialVolume: cheeseType._avg.initialVolume ?? 0,
            avgWeightAfterPress:
              cheeseTypeAvgWeightAfterPress?._avg.weightBeforeSalting ?? 0,
            avgFinalWeight:
              cheeseTypeAvgFinalWeight?._avg.weightAfterMaturation ?? 0,
          };
        });

        return cheeseTypeWeightStats;
      } catch (error) {
        console.error("Error getting cheese types weight stats", error);

        throw new DatabaseError("Error getting cheese types weight stats");
      }
    };
}

export default BatchRepository;
