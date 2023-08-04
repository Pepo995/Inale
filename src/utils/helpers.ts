import type {
  Batch,
  BatchStep,
  BatchWithDairy,
  DairyCheeseType,
  DairyForm,
  DairyCreateForm,
  DairyWithProducerAndEmployees,
  Employee,
  EmployeeInfo,
  ForgotStep,
  CheeseTypeActiveForm,
  DairyCheeseTypeFormInfo,
  CheeseType,
  CheeseTypePageInfo,
  FormatedDateBatchWithDairy,
  FormatedDateDairyCheese,
  FormatedDateDairy,
  Dairy,
} from "@types";
import { format, parse } from "date-fns";

export const formatDate = (date?: Date | null) =>
  date ? format(date, "dd/MM/yyyy") : undefined;

export const formatTime = (date?: Date | null) =>
  date ? format(date, "HH:mm") : undefined;

export const formatDateTime = (date?: Date | null) =>
  date ? format(date, "dd/MM/yyyy HH:mm") : undefined;

export const parseDate = (date?: string) =>
  !!date ? parse(`${date}`, "dd/MM/yyyy", new Date()) : undefined;

/**
 * @param dateTime Expected format dd/MM/yyyy HH:mm
 * @returns Date
 */
export const parseDateTime = (dateTime: string) =>
  parse(dateTime, "dd/MM/yyyy HH:mm", new Date());

export const formatToStringTime = (minutes: number) => {
  if (minutes < 60) return format(new Date(0, 0, 0, 0, minutes), "m 'm'");

  if (minutes < 24 * 60 && minutes % 60 === 0)
    return format(new Date(0, 0, 0, 0, minutes), "H 'h'");

  if (minutes < 24 * 60)
    return format(new Date(0, 0, 0, 0, minutes), "H 'h y' m 'm'");

  if (minutes < 24 * 60 * 30 && minutes % (24 * 60) === 0)
    return format(new Date(0, 0, 0, 0, minutes), "d 'd'");

  if (minutes < 24 * 60 * 30)
    return format(new Date(0, 0, 0, 0, minutes), "d 'd y' H 'h'");

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes - days * (24 * 60)) / 60);
  return `${days} d${hours === 0 ? "" : ` y ${hours} H`}`;
};

export const formatToTimeRange = (minMinutes: number, maxMinutes: number) =>
  `${formatToStringTime(minMinutes)} - ${formatToStringTime(maxMinutes)}`;

export const batchCurrentStep: (
  batch: Partial<Batch | BatchWithDairy>
) => BatchStep = (batch) => {
  if (batch.maturationEndDateTime) return "Finished";
  if (batch.maturationInitDateTime) return "Maturation";
  if (batch.saltingInitDateTime) return "Salting";
  if (batch.curdEndDateTime) return "CurdFinished";
  if (batch.curdInitDateTime) return "Curd";
  if (batch.started) return "Started";
  return "NotStarted";
};

export const generateForgotStepBatchUpdateData = (
  values: ForgotStep,
  data?: Batch | null
) => ({
  batchId: data?.id ?? "",
  initialVolume: values.initialVolume
    ? Number(values.initialVolume)
    : undefined,
  curdInitDateTime: parseDateTime(
    `${values.curdInitDate} ${values.curdInitTime}`
  ),
  curdEndDateTime:
    values.curdEndDate && values.curdEndTime
      ? parseDateTime(`${values.curdEndDate} ${values.curdEndTime}`)
      : undefined,
  weightBeforeSalting: values.weightBeforeSalting
    ? Number(values.weightBeforeSalting)
    : undefined,
  saltingInitDateTime:
    values.saltingInitDate && values.saltingInitTime
      ? parseDateTime(`${values.saltingInitDate} ${values.saltingInitTime}`)
      : undefined,
  maturationInitDateTime:
    values.maturationInitDate && values.maturationInitTime
      ? parseDateTime(
          `${values.maturationInitDate} ${values.maturationInitTime}`
        )
      : undefined,
  maturationEndDateTime:
    values.maturationEndDate && values.maturationEndTime
      ? parseDateTime(`${values.maturationEndDate} ${values.maturationEndTime}`)
      : undefined,
  weightAfterMaturation: values.weightAfterMaturation
    ? Number(values.weightAfterMaturation)
    : undefined,
});

export const mapRouteFromStep = (step?: BatchStep) => {
  switch (step) {
    case "NotStarted":
    case "Started":
      return "start-batch";
    case "Curd":
      return "start-curd";
    case "CurdFinished":
      return "finish-curd";
    case "Salting":
      return "start-salting";
    case "Maturation":
      return "start-maturation";
    case "Finished":
      return "finish-batch";
    default:
      return "";
  }
};

export const convertDairyToForm = (
  dairyInfo: DairyWithProducerAndEmployees
) => ({
  ...dairyInfo,
  companyNumber: dairyInfo.companyNumber?.toString(),
  endorsementDate: formatDate(dairyInfo.endorsementDate),
  bromatologicalRegistry: dairyInfo.bromatologicalRegistry?.toString(),
  dicoseNumber: dairyInfo.dicoseNumber?.toString(),
  enabledSince: formatDate(dairyInfo.enabledSince),
  registrationCode: dairyInfo.registrationCode ?? undefined,
  address: dairyInfo.address ?? undefined,
  contactPhone: dairyInfo.contactPhone ?? undefined,
  department: dairyInfo.department ?? undefined,
});

export const convertDairyToCreateForm = (
  dairyInfo: DairyWithProducerAndEmployees
) => ({
  ...dairyInfo,
  ...convertDairyToForm(dairyInfo),
});

export const convertDairyFromForm = (rut: number, dairyInfo: DairyForm) => ({
  ...dairyInfo,
  rut,
  companyNumber: dairyInfo.companyNumber
    ? parseInt(dairyInfo.companyNumber)
    : null,
  bromatologicalRegistry: dairyInfo.bromatologicalRegistry
    ? parseInt(dairyInfo.bromatologicalRegistry)
    : null,
  dicoseNumber: dairyInfo.dicoseNumber
    ? parseInt(dairyInfo.dicoseNumber)
    : null,
  endorsementDate: parseDate(dairyInfo.endorsementDate ?? undefined) ?? null,
  enabledSince: parseDate(dairyInfo.enabledSince ?? undefined) ?? null,
  department: dairyInfo.department ?? null,
});

export const convertEmployeesToTable = (employees: Employee[]) =>
  employees.map((employee) => ({
    ...employee,
    document: employee.document.toString(),
    id: employee.document.toString(),
    dairyRut: employee.dairyRut.toString(),
  }));

const convertEmployeeFromTable = (
  employeeInfo: EmployeeInfo,
  dairyRut: number
) => ({
  ...employeeInfo,
  document: parseInt(employeeInfo.document),
  dairyRut,
});

export const convertEmployeesFromTable = (
  employeesInfo: EmployeeInfo[],
  dairyRut: number
) =>
  employeesInfo.map((employeeInfo) =>
    convertEmployeeFromTable(employeeInfo, dairyRut)
  );

export const convertCheeseTypeToPage: (
  cheeseType: CheeseType
) => CheeseTypePageInfo = (cheeseType) => ({
  ...cheeseType,
  id: cheeseType.name,

  registrationCode: cheeseType.registrationCode ?? undefined,
  bromatologicalForm: cheeseType.bromatologicalForm ?? undefined,
  minCurdTemperature: cheeseType.minCurdTemperature.toString(),
  maxCurdTemperature: cheeseType.maxCurdTemperature.toString(),
  minCurdMinutes: cheeseType.minCurdMinutes.toString(),
  maxCurdMinutes: cheeseType.maxCurdMinutes.toString(),
  minSaltingSalinity: cheeseType.minSaltingSalinity.toString(),
  maxSaltingSalinity: cheeseType.maxSaltingSalinity.toString(),
  minSaltingMinutes: cheeseType.minSaltingMinutes.toString(),
  maxSaltingMinutes: cheeseType.maxSaltingMinutes.toString(),
  minMaturationTemperature: cheeseType.minMaturationTemperature.toString(),
  maxMaturationTemperature: cheeseType.maxMaturationTemperature.toString(),
  minMaturationHumidity: cheeseType.minMaturationHumidity.toString(),
  maxMaturationHumidity: cheeseType.maxMaturationHumidity.toString(),
  minMaturationMinutes: cheeseType.minMaturationMinutes.toString(),
  maxMaturationMinutes: cheeseType.maxMaturationMinutes.toString(),
  active: !cheeseType.deleted,
  hideDelete: !!cheeseType.deleted,
  hideView: !!cheeseType.deleted,
  hideRestore: !cheeseType.deleted,
});

export const convertCheeseTypeFromPage: (
  cheeseType: CheeseTypePageInfo
) => CheeseType = (cheeseType) => ({
  ...cheeseType,

  registrationCode: cheeseType.registrationCode ?? undefined,
  bromatologicalForm: cheeseType.bromatologicalForm ?? undefined,
  minCurdTemperature: parseInt(cheeseType.minCurdTemperature),
  maxCurdTemperature: parseInt(cheeseType.maxCurdTemperature),
  minCurdMinutes: parseInt(cheeseType.minCurdMinutes),
  maxCurdMinutes: parseInt(cheeseType.maxCurdMinutes),
  minSaltingSalinity: parseInt(cheeseType.minSaltingSalinity),
  maxSaltingSalinity: parseInt(cheeseType.maxSaltingSalinity),
  minSaltingMinutes: parseInt(cheeseType.minSaltingMinutes),
  maxSaltingMinutes: parseInt(cheeseType.maxSaltingMinutes),
  minMaturationTemperature: parseInt(cheeseType.minMaturationTemperature),
  maxMaturationTemperature: parseInt(cheeseType.maxMaturationTemperature),
  minMaturationHumidity: parseInt(cheeseType.minMaturationHumidity),
  maxMaturationHumidity: parseInt(cheeseType.maxMaturationHumidity),
  minMaturationMinutes: parseInt(cheeseType.minMaturationMinutes),
  maxMaturationMinutes: parseInt(cheeseType.maxMaturationMinutes),
});

export const convertDairyCheeseTypesToTable = (
  cheeseTypes: DairyCheeseType[]
) =>
  cheeseTypes.map((cheeseType) => ({
    ...cheeseType,
    id: cheeseType.cheeseTypeName,
    dairyRut: cheeseType.dairyRut.toString(),
    active: !cheeseType.deleted,
    hideDelete: !!cheeseType.deleted,
    hideView: !!cheeseType.deleted,
    hideRestore: !cheeseType.deleted,
    batchesInProduction: cheeseType.batchesInProduction?.toString() ?? "",
  }));

const convertToDairyCheeseTypeFromTable = (
  dairyCheeseTypeInfo: CheeseTypeActiveForm,
  dairyRut: number
) => ({
  ...dairyCheeseTypeInfo,
  dairyRut,
});

export const convertToDairyCheeseTypesFromForm = (
  dairyCheeseTypesInfo: CheeseTypeActiveForm[],
  dairyRut: number
) =>
  dairyCheeseTypesInfo.map((dairyCheeseTypeInfo) =>
    convertToDairyCheeseTypeFromTable(dairyCheeseTypeInfo, dairyRut)
  );

export const convertDairyFromCreateForm = (
  rut: number,
  dairyInfo: DairyCreateForm
) => ({
  ...dairyInfo,
  ...convertDairyFromForm(rut, dairyInfo),
  employees: [],
  cheeseTypes: [],
});

export const convertCheeseTypeFromCreatePage = (
  cheeseTypeInfo: DairyCheeseTypeFormInfo
) => ({
  ...cheeseTypeInfo,
});

export const serializableDairyCheeseType = (
  dairyCheeseType: DairyCheeseType
): FormatedDateDairyCheese => ({
  ...dairyCheeseType,
  deleted: dairyCheeseType.deleted
    ? (formatDateTime(dairyCheeseType.deleted) as string)
    : null,
  batchesInProduction: dairyCheeseType.batchesInProduction ?? null,
});

export const serializableBatchWithDairy = (
  batch: BatchWithDairy
): FormatedDateBatchWithDairy => {
  return {
    ...batch,
    createdAt: formatDateTime(batch.createdAt) as string,
    curdInitDateTime: batch.curdInitDateTime
      ? (formatDateTime(batch.curdInitDateTime) as string)
      : null,
    curdEndDateTime: batch.curdEndDateTime
      ? (formatDateTime(batch.curdEndDateTime) as string)
      : null,
    saltingInitDateTime: batch.saltingInitDateTime
      ? (formatDateTime(batch.saltingInitDateTime) as string)
      : null,
    maturationInitDateTime: batch.maturationInitDateTime
      ? (formatDateTime(batch.maturationInitDateTime) as string)
      : null,
    maturationEndDateTime: batch.maturationEndDateTime
      ? (formatDateTime(batch.maturationEndDateTime) as string)
      : null,
    currentStepDateTime: batch.currentStepDateTime
      ? (formatDateTime(batch.currentStepDateTime) as string)
      : null,
    batchName: batch.batchName ?? "",
    dairyCheeseType: serializableDairyCheeseType(batch.dairyCheeseType),
    dairy: serializableDairy(batch.dairy),
    certificationMessages: batch.certificationMessages ?? null,
  };
};

export const serializableDairy = (dairy: Dairy): FormatedDateDairy => ({
  ...dairy,
  createdAt: formatDateTime(dairy.createdAt) as string,
  deleted: dairy.deleted ? (formatDateTime(dairy.deleted) as string) : null,
  enabledSince: dairy.enabledSince
    ? (formatDate(dairy.enabledSince) as string)
    : null,
  endorsementDate: dairy.endorsementDate
    ? (formatDate(dairy.endorsementDate) as string)
    : null,
});

export const parseBatchDatesToDate = (
  batch: FormatedDateBatchWithDairy
): BatchWithDairy => {
  return {
    ...batch,
    createdAt: parseDateTime(batch.createdAt),
    curdInitDateTime: batch.curdInitDateTime
      ? parseDateTime(batch.curdInitDateTime)
      : null,
    curdEndDateTime: batch.curdEndDateTime
      ? parseDateTime(batch.curdEndDateTime)
      : null,
    saltingInitDateTime: batch.saltingInitDateTime
      ? parseDateTime(batch.saltingInitDateTime)
      : null,
    maturationInitDateTime: batch.maturationInitDateTime
      ? parseDateTime(batch.maturationInitDateTime)
      : null,
    maturationEndDateTime: batch.maturationEndDateTime
      ? parseDateTime(batch.maturationEndDateTime)
      : null,
    currentStepDateTime: batch.currentStepDateTime
      ? parseDateTime(batch.currentStepDateTime)
      : undefined,
    dairyCheeseType: {
      ...batch.dairyCheeseType,
      deleted: batch.dairyCheeseType.deleted
        ? parseDateTime(batch.dairyCheeseType.deleted)
        : undefined,
      batchesInProduction:
        batch.dairyCheeseType.batchesInProduction ?? undefined,
    },
    dairy: parseDairyDatesToDate(batch.dairy),
    certificationMessages: batch.certificationMessages ?? undefined,
  };
};

export const parseDairyDatesToDate = (dairy: FormatedDateDairy): Dairy => ({
  ...dairy,
  createdAt: parseDateTime(dairy.createdAt ?? undefined),
  deleted: dairy.deleted ? parseDateTime(dairy.deleted) : undefined,
  enabledSince: dairy.enabledSince
    ? (parseDate(dairy.enabledSince) as Date)
    : null,
  endorsementDate: dairy.endorsementDate
    ? (parseDate(dairy.endorsementDate) as Date)
    : null,
});
