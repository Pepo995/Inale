import type { LucideIcon } from "lucide-react";
import { type ReactElement } from "react";

import type { z, infer as zInfer } from "zod";
import type {
  forgotStepSchema,
  employeeFormSchema,
  updateDairyFormSchema,
  createDairyFormSchema,
  cheeseTypeActiveSchema,
  dairyCheeseTypeFormSchema,
  createCheeseTypePageSchema,
  curdInputSchema,
  saltingInputSchema,
  maturationInputSchema,
} from "./schemas";
import {
  type PrismaClient,
  type Batch as PrismaBatch,
  type Dairy as PrismaDairy,
  type DairyCheeseType as PrismaDairyCheeseType,
  type User as PrismaUser,
  type Employee as PrismaEmployee,
  type CheeseType as PrismaCheeseType,
  type Certified as PrismaCertified,
  Department as PrismaDepartment,
} from "@prisma/client";

export type IColumnType<T> = {
  key: keyof T;
  title: string;
  width?: number;
  render?: (column: IColumnType<T>, item: T) => ReactElement;
};

export type TableSize = "sm" | "md" | "lg";

export type FormatedDateDairyCheese = Omit<
  DairyCheeseType,
  "deleted" | "batchesInProduction"
> & {
  deleted: string | null;
  batchesInProduction: number | null;
};

export type TableItem = {
  id?: string;
  [k: string]: string | undefined | number;
};

export type SidebarItemProps = {
  titleKey: string;
  path: string;
  selected?: boolean;
  Icon: LucideIcon;
};

export type ChartProps = {
  labels: string[];
  datasets: { label: string; data: number[] }[];
  title?: string;
};

export type Context = {
  prisma: PrismaClient;
};

export type Batch = Omit<PrismaBatch, "dairyRut" | "certificationMessage"> & {
  certificationMessages?: CertificationFail[];
  dairyRut: number;
  currentStep?: BatchStep;
  currentStepDateTime?: Date;
};

export type FormatedDateBatchWithDairy = Omit<
  BatchWithDairy,
  | "createdAt"
  | "curdInitDateTime"
  | "curdEndDateTime"
  | "saltingInitDateTime"
  | "maturationInitDateTime"
  | "maturationEndDateTime"
  | "dairyCheeseType"
  | "dairy"
  | "currentStepDateTime"
  | "certificationMessages"
> & {
  createdAt: string;
  curdInitDateTime: string | null;
  curdEndDateTime: string | null;
  saltingInitDateTime: string | null;
  maturationInitDateTime?: string | null;
  maturationEndDateTime?: string | null;
  currentStepDateTime: string | null;
  dairyCheeseType: FormatedDateDairyCheese;
  dairy: FormatedDateDairy;
  certificationMessages: CertificationFail[] | null;
};

export type Dairy = Omit<PrismaDairy, "rut" | "deleted"> & {
  rut: number;
  producer?: Partial<PrismaUser>;
  deleted?: Date;
};

export type Employee = Omit<PrismaEmployee, "document" | "dairyRut"> & {
  document: number;
  dairyRut: number;
};

export type CheeseType = Omit<
  PrismaCheeseType,
  "registrationCode" | "bromatologicalForm" | "deleted"
> & { registrationCode?: string; bromatologicalForm?: string; deleted?: Date };

export type DairyCheeseType = Omit<
  PrismaDairyCheeseType,
  "dairyRut" | "deleted"
> & {
  dairyRut: number;
  batchesInProduction?: number;
  active?: boolean;
  deleted?: Date;
};

export type DairyWithProducerAndEmployees = Dairy & {
  producer?: Partial<PrismaUser>;
  employees: Employee[];
  cheeseTypes: DairyCheeseType[];
};

export type DairyWithBatches = Dairy & {
  batches: Batch[];
};

export type DairyForm = z.infer<typeof updateDairyFormSchema>;

export type DairyCreateForm = z.infer<typeof createDairyFormSchema>;

export type EmployeeInfo = z.infer<typeof employeeFormSchema>;

export type CheeseTypeActiveForm = z.infer<typeof cheeseTypeActiveSchema>;

export type CheeseTypePageInfo = z.infer<typeof createCheeseTypePageSchema>;

export type DairyCheeseTypeFormInfo = z.infer<typeof dairyCheeseTypeFormSchema>;

export type BatchWithDairy = Batch & {
  dairy: Dairy;
  dairyCheeseType: DairyCheeseType;
};

export type FormatedDateDairy = Omit<
  Dairy,
  "createdAt" | "deleted" | "enabledSince" | "endorsementDate"
> & {
  deleted: string | null;
  createdAt: string;
  enabledSince: string | null;
  endorsementDate: string | null;
};

export type ForgotStep = zInfer<typeof forgotStepSchema>;

export type BatchStep =
  | "NotStarted"
  | "Started"
  | "Curd"
  | "CurdFinished"
  | "Salting"
  | "Maturation"
  | "Finished";

export type CreatedBatchesUrls = {
  [dairyRut: string]: {
    url: string;
    tagKeys: { dairyName: string; batchNumber: number };
  }[];
};

export type BatchStats = {
  batchesInProcess: number;
  batchesCertified: number;
  batchesFailed: number;
};

export type User = PrismaUser;

export type Certified = keyof typeof PrismaCertified;

export const EnumDepartment = PrismaDepartment;

export type Department = keyof typeof EnumDepartment;

/**
 * Sensors
 */
export type CurdRead = Omit<
  z.infer<typeof curdInputSchema>,
  "datetime" | "apiKey"
> & {
  datetime: Date;
};

export type SaltingRead = Omit<
  z.infer<typeof saltingInputSchema>,
  "datetime" | "apiKey"
> & {
  datetime: Date;
};

export type MaturationRead = Omit<
  z.infer<typeof maturationInputSchema>,
  "datetime" | "apiKey"
> & {
  datetime: Date;
};

export type SensorReads = {
  curd: Omit<CurdRead, "dairyRut">[];
  salting: Omit<SaltingRead, "dairyRut">[];
  maturation: Omit<MaturationRead, "dairyRut">[];
};

export type CurdAverageSensorReads = {
  averageTemperatureInCurd: number | null;
};

export type SaltingAverageSensorReads = {
  averageSalinityInSalting: number | null;
};

export type MaturationAverageSensorReads = {
  averageTemperatureInMaturation: number | null;
  averageHumidityInMaturation: number | null;
};

export type ErrorType = {
  success: false;
  message: string;
  translationKey?: string;
};

export type BatchesPerMonth = {
  [month: number]: number;
};

export type CheeseTypeWeightStats = {
  cheeseType: string;
  avgInitialVolume: number;
  avgWeightAfterPress: number;
  avgFinalWeight: number;
};

export type SensorReadsCount = {
  [date: string]: { curd: number; salting: number; maturation: number };
};

export enum EnumFailTypes {
  /** Inadmissible **/
  curdNoReadsInadmissible = 1,
  saltingNoReadsInadmissible = 2,
  maturationNoReadsInadmissible = 3,

  curdMinTimeInadmissible = 4,
  curdMaxTimeInadmissible = 5,
  saltingMinTimeInadmissible = 6,
  saltingMaxTimeInadmissible = 7,
  maturationMinTimeInadmissible = 8,
  maturationMaxTimeInadmissible = 9,

  curdMinTemperatureInadmissible = 10,
  curdMaxTemperatureInadmissible = 11,
  saltingMinSalinityInadmissible = 12,
  saltingMaxSalinityInadmissible = 13,
  maturationMinTemperatureInadmissible = 14,
  maturationMaxTemperatureInadmissible = 15,
  maturationMinHumidityInadmissible = 16,
  maturationMaxHumidityInadmissible = 17,

  /** Admissible **/
  curdMinTimeAdmissible = 18,
  curdMaxTimeAdmissible = 19,
  saltingMinTimeAdmissible = 20,
  saltingMaxTimeAdmissible = 21,
  maturationMinTimeAdmissible = 22,
  maturationMaxTimeAdmissible = 23,

  curdMinTemperatureAdmissible = 24,
  curdMaxTemperatureAdmissible = 25,
  saltingMinSalinityAdmissible = 26,
  saltingMaxSalinityAdmissible = 27,
  maturationMinTemperatureAdmissible = 28,
  maturationMaxTemperatureAdmissible = 29,
  maturationMinHumidityAdmissible = 30,
  maturationMaxHumidityAdmissible = 31,
}

export type CertificationFail = {
  message: string;
  failType: EnumFailTypes;
};

export type BlockchainCertificationInfo = {
  id: string;
  certificationMessages?: CertificationFail[];
  batchName?: string;
  cheeseType: string;
  dairyName: string;
  dairyRut: number;
  status: Certified;
  certificationDate: Date;
};
