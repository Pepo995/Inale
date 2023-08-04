import type {
  DairyCheeseType as PrismaDairyCheeseType,
  Dairy as PrismaDairy,
  Employee as PrismaEmployee,
  User as PrismaUser,
  Batch as PrismaBatch,
  CheeseType as PrismaCheeseType,
} from "@prisma/client";
import type { CertificationFail, CheeseType } from "@types";

const convertEmployeeToOutside = (employee: PrismaEmployee) => ({
  ...employee,
  document: parseInt(employee.document.toString()),
  dairyRut: parseInt(employee.dairyRut.toString()),
});

const convertDairyToOutside = (
  dairy: PrismaDairy & {
    employees?: PrismaEmployee[];
    producer?: Partial<PrismaUser>;
    cheeseTypes?: PrismaDairyCheeseType[];
  }
) => ({
  ...dairy,
  deleted: dairy.deleted ?? undefined,
  rut: parseInt(dairy.rut.toString()),
  employees:
    dairy.employees?.map((employee) => convertEmployeeToOutside(employee)) ??
    [],
  cheeseTypes:
    dairy.cheeseTypes?.map((dairyCheeseType) =>
      convertDairyCheeseTypeToOutside(dairyCheeseType)
    ) ?? [],
});

const convertCheeseTypeToOutside: (
  cheeseType: PrismaCheeseType
) => CheeseType = (cheeseType) => ({
  ...cheeseType,
  registrationCode: cheeseType.registrationCode ?? undefined,
  bromatologicalForm: cheeseType.bromatologicalForm ?? undefined,
  deleted: cheeseType.deleted ?? undefined,
});

const convertBatchToOutside = (batch: PrismaBatch) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { certificationMessage, ...batchWithoutMessage } = batch;
  return {
    ...batchWithoutMessage,
    certificationMessages: batch.certificationMessage
      ? (JSON.parse(batch.certificationMessage) as CertificationFail[])
      : undefined,
    dairyRut: parseInt(batch.dairyRut.toString()),
  };
};

const convertDairyCheeseTypeToOutside = (
  dairyCheeseType: PrismaDairyCheeseType & { _count?: { batches: number } }
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _count, ...dairyCheeseTypeToReturn } = dairyCheeseType;
  return {
    ...dairyCheeseTypeToReturn,
    dairyRut: parseInt(dairyCheeseType.dairyRut.toString()),
    batchesInProduction: dairyCheeseType._count?.batches ?? undefined,
    deleted: dairyCheeseTypeToReturn.deleted ?? undefined,
  };
};

export {
  convertDairyToOutside,
  convertCheeseTypeToOutside,
  convertEmployeeToOutside,
  convertBatchToOutside,
  convertDairyCheeseTypeToOutside,
};
