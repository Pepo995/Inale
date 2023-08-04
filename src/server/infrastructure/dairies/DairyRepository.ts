import {
  DatabaseError,
  NotFoundError,
  PrismaErrorCodes,
  UniqueConstraintFailedError,
} from "@errors";
import {
  convertBatchToOutside,
  convertDairyCheeseTypeToOutside,
  convertDairyToOutside,
} from "../converters";
import { type IDairyRepository } from "./IDairyRepository";
import { Prisma, type PrismaClient } from "@prisma/client";
import type { CertificationFail, DairyCheeseType, Employee } from "@types";

class DairyRepository implements IDairyRepository {
  private ctx;

  private static countBatchesInProduction = {
    _count: {
      select: {
        batches: {
          where: { started: true, maturationEndDateTime: null },
        },
      },
    },
  };

  constructor(ctx: {
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
  }) {
    this.ctx = ctx;
  }

  getAllDairiesWithProducerAndEmployees: IDairyRepository["getAllDairiesWithProducerAndEmployees"] =
    async (includeDeleted) => {
      const dairies = await this.ctx.prisma.dairy.findMany({
        where: { deleted: includeDeleted ? undefined : null },
        include: {
          producer: { select: { name: true } },
          employees: true,
          cheeseTypes: true,
        },
      });
      return dairies.map((dairy) => convertDairyToOutside(dairy));
    };

  getAllDairies: IDairyRepository["getAllDairies"] = async (includeDeleted) => {
    const dairies = await this.ctx.prisma.dairy.findMany({
      where: { deleted: includeDeleted ? undefined : null },
      include: {
        producer: { select: { name: true } },
      },
    });
    return dairies.map((dairy) => convertDairyToOutside(dairy));
  };

  /**
   * @throws NotFoundError
   */
  getDairyByRut: IDairyRepository["getDairyByRut"] = async (rut: number) => {
    const dairy = await this.ctx.prisma.dairy.findUnique({
      include: {
        producer: { select: { name: true } },
        employees: true,
        cheeseTypes: {
          include: DairyRepository.countBatchesInProduction,
        },
      },
      where: { rut },
    });

    if (!dairy)
      throw new NotFoundError(
        `Dairy with rut "${rut}" couldn't be loaded`,
        "DAIRY"
      );

    return convertDairyToOutside(dairy);
  };

  getDairyCheeseTypesByRut: IDairyRepository["getDairyCheeseTypesByRut"] =
    async (dairyRut: number) =>
      (
        await this.ctx.prisma.dairyCheeseType.findMany({
          where: { dairyRut },
        })
      ).map((dairyCheeseType) =>
        convertDairyCheeseTypeToOutside(dairyCheeseType)
      );

  /**
   * @throws NotFoundError
   */
  getDairyWithBatchesByRut: IDairyRepository["getDairyWithBatchesByRut"] =
    async (dairyRut: number) => {
      const dairy = await this.ctx.prisma.dairy.findUnique({
        where: { rut: dairyRut },
        include: {
          cheeseTypes: {
            include: {
              batches: true,
            },
          },
          employees: true,
        },
      });

      if (!dairy) throw new NotFoundError("Dairy not found", "DAIRY");

      const { cheeseTypes, ...data } = dairy;

      return {
        ...convertDairyToOutside(data),
        batches: cheeseTypes.flatMap((cheeseType) =>
          cheeseType.batches.map((batch) => convertBatchToOutside(batch))
        ),
      };
    };

  /**
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createDairy: IDairyRepository["createDairy"] = async ({
    producerName,
    ...input
  }) => {
    try {
      const dairy = await this.ctx.prisma.$transaction(async (tx) => {
        const producer = await tx.user.create({
          data: {
            name: producerName,
          },
          select: {
            id: true,
          },
        });

        if (!producer) throw new DatabaseError("Producer cannot be created");

        return tx.dairy.create({
          data: {
            ...input,
            producerId: producer.id,
            employees: undefined,
            cheeseTypes: undefined,
          },
        });
      });

      return convertDairyToOutside(dairy);
    } catch (error) {
      console.error("[Error creating dairy]", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaErrorCodes.UniqueConstraintFailed) {
          throw new UniqueConstraintFailedError(
            "There is a unique constraint violation, a new dairy cannot be created with this rut"
          );
        }
      }

      throw new DatabaseError("Error creating dairy");
    }
  };

  updateDairyInfo: IDairyRepository["updateDairyInfo"] = async (input) => {
    const {
      rut,
      employees: currentEmployees,
      cheeseTypes: currentCheeseTypes,
      ...data
    } = input;

    try {
      const updatedDairy = await this.ctx.prisma.$transaction(async () => {
        /**
         * Updating dairy info.
         */
        const dairy = await this.ctx.prisma.dairy.update({
          where: { rut },
          include: {
            employees: true,
            cheeseTypes: true,
          },
          data,
        });

        /**
         * Updating dairy employees.
         */
        const currentEmployeesMap = new Map<number, Employee>();

        currentEmployees.forEach((currentEmployee) =>
          currentEmployeesMap.set(currentEmployee.document, currentEmployee)
        );

        const employeesToDelete = dairy.employees.filter(
          (oldEmployee) =>
            !currentEmployeesMap.get(Number(oldEmployee.document))
        );

        await Promise.all(
          employeesToDelete.map(
            async (employeeToDelete) =>
              await this.ctx.prisma.employee.delete({
                where: { document: employeeToDelete.document },
              })
          )
        );

        const updatedEmployees = await Promise.all(
          currentEmployees.map(async (currentEmployee) => {
            return await this.ctx.prisma.employee.upsert({
              where: { document: currentEmployee.document },
              update: { name: currentEmployee.name },
              create: currentEmployee,
            });
          })
        );

        /**
         * Updating dairy cheese types.
         */
        const cheeseTypeMap = new Map<string, DairyCheeseType>();

        currentCheeseTypes.forEach((cheeseType) =>
          cheeseTypeMap.set(cheeseType.cheeseTypeName, cheeseType)
        );

        const cheeseTypesToDelete = dairy.cheeseTypes.filter(
          (oldCheeseType) =>
            !cheeseTypeMap.get(oldCheeseType.cheeseTypeName)?.active
        );

        await Promise.all(
          cheeseTypesToDelete.map(async (cheeseType) => {
            return await this.ctx.prisma.dairyCheeseType.delete({
              where: {
                dairyRut_cheeseTypeName: {
                  dairyRut: cheeseType.dairyRut,
                  cheeseTypeName: cheeseType.cheeseTypeName,
                },
              },
            });
          })
        );

        const cheeseTypesToUpsert = currentCheeseTypes.filter(
          (cheeseType) => cheeseType.active
        );

        const updatedCheeseTypes = await Promise.all(
          cheeseTypesToUpsert.map(async (cheeseType) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { active, ...cheeseTypeToCreate } = cheeseType;
            return await this.ctx.prisma.dairyCheeseType.upsert({
              where: {
                dairyRut_cheeseTypeName: {
                  dairyRut: cheeseType.dairyRut,
                  cheeseTypeName: cheeseType.cheeseTypeName,
                },
              },
              include: DairyRepository.countBatchesInProduction,
              update: {
                cheeseTypeName: cheeseType.cheeseTypeName,
                deleted: null,
              },
              create: cheeseTypeToCreate,
            });
          })
        );

        return convertDairyToOutside({
          ...dairy,
          employees: updatedEmployees,
          cheeseTypes: updatedCheeseTypes,
        });
      });

      return updatedDairy;
    } catch (error) {
      console.error("[Error updating dairy]", error);

      throw new DatabaseError("Error updating dairy");
    }
  };

  /**
   * @throws NotFoundError
   */
  deleteDairy: IDairyRepository["deleteDairy"] = async (rut) => {
    const dairy = await this.ctx.prisma.dairy.delete({
      where: { rut },
    });

    if (!dairy) throw new NotFoundError("Dairy not found", "DAIRY");

    return convertDairyToOutside(dairy);
  };

  /**
   * @throws NotFoundError
   */
  restoreDairy: IDairyRepository["restoreDairy"] = async (rut) => {
    const dairy = await this.ctx.prisma.dairy.update({
      data: { deleted: null },
      where: { rut },
    });

    if (!dairy) throw new NotFoundError("Dairy not found", "DAIRY");

    return convertDairyToOutside(dairy);
  };

  /**
   * @throws DatabaseError
   */
  getDairyLocationStats: IDairyRepository["getDairyLocationStats"] =
    async () => {
      try {
        const departments = await this.ctx.prisma.dairy.groupBy({
          by: ["department"],
          _count: true,
        });
        return departments.map((departmentInfo) => ({
          department: departmentInfo.department ?? undefined,
          amount: departmentInfo._count,
        }));
      } catch (error) {
        console.error("Error getting dairy location stats", error);

        throw new DatabaseError("Error getting dairy location stats");
      }
    };

  /**
   * @throws DatabaseError
   */
  getDairyFailedCertifications: IDairyRepository["getDairyFailedCertifications"] =
    async (rut, minDate, maxDate) => {
      try {
        const batches = await this.ctx.prisma.batch.findMany({
          where: {
            dairyRut: rut,
            certified: "CertificationFailed",
            maturationEndDateTime: { lte: maxDate, gte: minDate },
          },
        });

        const failArrays: CertificationFail[][] = batches.map(
          (batch) =>
            JSON.parse(
              batch.certificationMessage ?? "[]"
            ) as CertificationFail[]
        );

        let fails: CertificationFail[] = [];
        failArrays.forEach((failArray) => (fails = fails.concat(failArray)));

        const result = fails.reduce(
          (acc, read) => {
            acc[read.failType] = (acc[read.failType] ?? 0) + 1;

            return acc;
          },
          {} as {
            [index: number]: number;
          }
        );

        return Object.entries(result).map((entry) => ({
          failType: parseInt(entry[0]),
          amount: entry[1],
        }));
      } catch (error) {
        console.error("Error getting failed certifications", error);

        throw new DatabaseError("Error getting failed certifications");
      }
    };
}

export default DairyRepository;
