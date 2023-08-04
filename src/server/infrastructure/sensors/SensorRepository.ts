import { Prisma, type PrismaClient } from "@prisma/client";
import { type ISensorRepository } from "./ISensorRepository";
import {
  PrismaErrorCodes,
  ForeignKeyFailedError,
  DatabaseError,
  UniqueConstraintFailedError,
} from "@errors";

class SensorRepository implements ISensorRepository {
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

  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createCurdRead: ISensorRepository["createCurdRead"] = async (read) => {
    try {
      await this.ctx.prisma.curdSensorData.create({ data: read });
    } catch (error) {
      console.error("[Error creating curd read]", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaErrorCodes.FKConstraintFailed) {
          throw new ForeignKeyFailedError(
            "There is a foreign key constraint violation, a new curd read cannot be created with this rut"
          );
        }

        if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
          throw new UniqueConstraintFailedError(
            "There is a unique constraint violation, there is a curd read with the same rut and datetime already"
          );
        }
      }

      throw new DatabaseError("Error creating curd read");
    }
  };

  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createSaltingRead: ISensorRepository["createSaltingRead"] = async (read) => {
    try {
      await this.ctx.prisma.saltingSensorData.create({ data: read });
    } catch (error) {
      console.error("[Error creating salting read]", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaErrorCodes.FKConstraintFailed) {
          throw new ForeignKeyFailedError(
            "There is a foreign key constraint violation, a new salting read cannot be created with this rut"
          );
        }

        if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
          throw new UniqueConstraintFailedError(
            "There is a unique constraint violation, there is a salting read with the same rut and datetime already"
          );
        }
      }

      throw new DatabaseError("Error creating salting read");
    }
  };

  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createMaturationRead: ISensorRepository["createMaturationRead"] = async (
    read
  ) => {
    try {
      await this.ctx.prisma.maturationSensorData.create({ data: read });
    } catch (error) {
      console.error("[Error creating maturation read]", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaErrorCodes.FKConstraintFailed) {
          throw new ForeignKeyFailedError(
            "There is a foreign key constraint violation, a new maturation read cannot be created with this rut"
          );
        }

        if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
          throw new UniqueConstraintFailedError(
            "There is a unique constraint violation, there is a maturation read with the same rut and datetime already"
          );
        }
      }

      throw new DatabaseError("Error creating maturation read");
    }
  };

  /**
   * @throws DatabaseError
   */
  getSensorReads: ISensorRepository["getSensorReads"] = async ({
    dairyRut,
    curdInitDateTime,
    curdEndDateTime,
    saltingInitDateTime,
    saltingEndDateTime,
    maturationInitDateTime,
    maturationEndDateTime,
  }) => {
    try {
      const curd = await this.ctx.prisma.curdSensorData.findMany({
        where: {
          dairyRut,
          datetime: {
            gte: curdInitDateTime,
            lte: curdEndDateTime,
          },
        },
      });
      const salting = await this.ctx.prisma.saltingSensorData.findMany({
        where: {
          dairyRut,
          datetime: {
            gte: saltingInitDateTime,
            lte: saltingEndDateTime,
          },
        },
      });
      const maturation = await this.ctx.prisma.maturationSensorData.findMany({
        where: {
          dairyRut,
          datetime: {
            gte: maturationInitDateTime,
            lte: maturationEndDateTime,
          },
        },
      });

      return {
        curd,
        salting,
        maturation,
      };
    } catch (error) {
      throw new DatabaseError("Error getting sensor reads");
    }
  };

  getCurdSensorAverageReads: ISensorRepository["getCurdSensorAverageReads"] =
    async ({ dairyRut, curdInitDateTime, curdEndDateTime }) => {
      try {
        const curdResult = await this.ctx.prisma.curdSensorData.aggregate({
          _avg: {
            temperature: true,
          },
          where: {
            datetime: {
              gte: curdInitDateTime,
              lte: curdEndDateTime,
            },
            dairyRut,
          },
        });
        const averageTemperatureInCurd = curdResult._avg.temperature;
        return {
          averageTemperatureInCurd,
        };
      } catch (error) {
        console.error("[Error getting curd average reads]", error);
        throw new DatabaseError("Error getting sensor reads");
      }
    };

  getSaltingSensorAverageReads: ISensorRepository["getSaltingSensorAverageReads"] =
    async ({ dairyRut, saltingInitDateTime, saltingEndDateTime }) => {
      try {
        const saltingResult = await this.ctx.prisma.saltingSensorData.aggregate(
          {
            _avg: {
              salinity: true,
            },
            where: {
              datetime: {
                gte: saltingInitDateTime,
                lte: saltingEndDateTime,
              },
              dairyRut,
            },
          }
        );
        const averageSalinityInSalting = saltingResult._avg.salinity;

        return {
          averageSalinityInSalting,
        };
      } catch (error) {
        console.error("[Error getting salting average reads]", error);
        throw new DatabaseError("Error getting sensor reads");
      }
    };

  getMaturationSensorAverageReads: ISensorRepository["getMaturationSensorAverageReads"] =
    async ({ dairyRut, maturationInitDateTime, maturationEndDateTime }) => {
      try {
        const maturationResult =
          await this.ctx.prisma.maturationSensorData.aggregate({
            _avg: {
              humidity: true,
              temperature: true,
            },
            where: {
              datetime: {
                gte: maturationInitDateTime,
                lte: maturationEndDateTime,
              },
              dairyRut,
            },
          });
        const averageHumidityInMaturation = maturationResult._avg.humidity;
        const averageTemperatureInMaturation =
          maturationResult._avg.temperature;

        return {
          averageHumidityInMaturation,
          averageTemperatureInMaturation,
        };
      } catch (error) {
        console.error("[Error getting maturation average reads]", error);
        throw new DatabaseError("Error getting sensor reads");
      }
    };

  getSensorReadsByDairyRutAndDateRange: ISensorRepository["getSensorReadsByDairyRutAndDateRange"] =
    async ({ dairyRut, minDate, maxDate }) => {
      try {
        const curd = await this.ctx.prisma.curdSensorData.findMany({
          where: {
            dairyRut,
            datetime: {
              gte: minDate,
              lte: maxDate,
            },
          },
        });

        const salting = await this.ctx.prisma.saltingSensorData.findMany({
          where: {
            dairyRut,
            datetime: {
              gte: minDate,
              lte: maxDate,
            },
          },
        });

        const maturation = await this.ctx.prisma.maturationSensorData.findMany({
          where: {
            dairyRut,
            datetime: {
              gte: minDate,
              lte: maxDate,
            },
          },
        });

        return {
          curd,
          salting,
          maturation,
        };
      } catch (error) {
        console.error("[Error getting sensor reads by dairy rut]", error);

        throw new DatabaseError("Error getting sensor reads");
      }
    };
}

export default SensorRepository;
