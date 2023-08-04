import { expect, it, jest } from "@jest/globals";
import BatchController from "@controllers/batches/BatchController";
import { faker } from "@faker-js/faker";

import type IGetTokenByBatchId from "@controllers/tokens/IGetTokenByBatchId";
import TokenController from "@controllers/tokens/TokenController";

import { type IBatchRepository } from "@infrastructure/batches/IBatchRepository";
import { type IDairyRepository } from "@infrastructure/dairies/IDairyRepository";
import { type ISensorRepository } from "@infrastructure/sensors/ISensorRepository";
import { type ICheeseTypeRepository } from "@infrastructure/cheeseTypes/ICheeseTypeRepository";
import { type IBlockchainRepository } from "@infrastructure/blockchain/IBlockchainRepository";

import { EnumFailTypes } from "@types";
import type {
  BatchWithDairy,
  CertificationFail,
  CheeseType,
  DairyWithBatches,
  SensorReads,
} from "@types";
import { ConsistencyError, PreconditionError } from "@errors";
import { formatDate } from "@utils";
import { format } from "date-fns";

/**
 * Mocks
 */
const createBatches = jest.fn<IBatchRepository["createBatches"]>();

const getCheeseTypeByDairyRut =
  jest.fn<IBatchRepository["getCheeseTypeByDairyRut"]>();

const updateBatch = jest.fn<IBatchRepository["updateBatch"]>();
const getBatchById = jest.fn<IBatchRepository["getBatchById"]>();

const batchRepository: IBatchRepository = {
  createBatches,
  getCheeseTypeByDairyRut,
  getBatchById,
  updateBatch,
  getBatchesByDateRange: jest.fn<IBatchRepository["getBatchesByDateRange"]>(),
  getBatchesStats: jest.fn<IBatchRepository["getBatchesStats"]>(),
  getCheeseTypesWeightStats:
    jest.fn<IBatchRepository["getCheeseTypesWeightStats"]>(),
};

const getDairyWithBatchesByRut =
  jest.fn<IDairyRepository["getDairyWithBatchesByRut"]>();

const dairyRepository: IDairyRepository = {
  updateDairyInfo: jest.fn<IDairyRepository["updateDairyInfo"]>(),
  createDairy: jest.fn<IDairyRepository["createDairy"]>(),
  getDairyCheeseTypesByRut:
    jest.fn<IDairyRepository["getDairyCheeseTypesByRut"]>(),
  getAllDairies: jest.fn<IDairyRepository["getAllDairies"]>(),
  getAllDairiesWithProducerAndEmployees:
    jest.fn<IDairyRepository["getAllDairiesWithProducerAndEmployees"]>(),
  getDairyByRut: jest.fn<IDairyRepository["getDairyByRut"]>(),
  getDairyWithBatchesByRut,
  deleteDairy: jest.fn<IDairyRepository["deleteDairy"]>(),
  restoreDairy: jest.fn<IDairyRepository["restoreDairy"]>(),
  getDairyLocationStats: jest.fn<IDairyRepository["getDairyLocationStats"]>(),
  getDairyFailedCertifications:
    jest.fn<IDairyRepository["getDairyFailedCertifications"]>(),
};

const getSensorReads = jest.fn<ISensorRepository["getSensorReads"]>();

const sensorRepository: ISensorRepository = {
  createCurdRead: jest.fn<ISensorRepository["createCurdRead"]>(),
  createSaltingRead: jest.fn<ISensorRepository["createSaltingRead"]>(),
  createMaturationRead: jest.fn<ISensorRepository["createMaturationRead"]>(),
  getCurdSensorAverageReads:
    jest.fn<ISensorRepository["getCurdSensorAverageReads"]>(),
  getMaturationSensorAverageReads:
    jest.fn<ISensorRepository["getMaturationSensorAverageReads"]>(),
  getSaltingSensorAverageReads:
    jest.fn<ISensorRepository["getSaltingSensorAverageReads"]>(),
  getSensorReads,
  getSensorReadsByDairyRutAndDateRange:
    jest.fn<ISensorRepository["getSensorReadsByDairyRutAndDateRange"]>(),
};

const getCheeseType = jest.fn<ICheeseTypeRepository["getCheeseType"]>();

const cheeseTypeRepository: ICheeseTypeRepository = {
  createCheeseType: jest.fn<ICheeseTypeRepository["createCheeseType"]>(),
  deleteCheeseType: jest.fn<ICheeseTypeRepository["deleteCheeseType"]>(),
  getAllCheeseTypes: jest.fn<ICheeseTypeRepository["getAllCheeseTypes"]>(),
  getCheeseType,
  restoreCheeseType: jest.fn<ICheeseTypeRepository["restoreCheeseType"]>(),
  updateCheeseType: jest.fn<ICheeseTypeRepository["updateCheeseType"]>(),
};

const blockchainRepository: IBlockchainRepository = {
  storeCertification: jest.fn<IBlockchainRepository["storeCertification"]>(),
  getCertification: jest.fn<IBlockchainRepository["getCertification"]>(),
};

/**
 * Test data
 */
const tokenObtainer: IGetTokenByBatchId = new TokenController();
const baseUrl = faker.internet.url();

const batchController = new BatchController({
  batchRepository,
  dairyRepository,
  sensorRepository,
  cheeseTypeRepository,
  tokenObtainer,
  blockchainRepository,
});

const batchesToCreate = Array.from(
  { length: faker.number.int({ min: 1, max: 5 }) },
  (_, index) => ({
    amount: faker.number.int({ min: 1, max: 8 }),
    dairyRut: 100000000000 + index,
  })
);

const rut = faker.number.int({ min: 1, max: 999999999999 });
const batchId = faker.string.uuid();
const cheeseTypeName = faker.lorem.words({ min: 1, max: 3 });
const batchName = `${faker.string.fromCharacters("MT")}-${
  formatDate(faker.date.anytime()) ?? ""
}`;

const cheeseTypeToReturn: CheeseType = {
  name: cheeseTypeName,
  minCurdTemperature: 10,
  maxCurdTemperature: 20,
  minCurdMinutes: 120,
  maxCurdMinutes: 360,
  minSaltingSalinity: 20,
  maxSaltingSalinity: 30,
  minSaltingMinutes: 240,
  maxSaltingMinutes: 340,
  minMaturationTemperature: 30,
  maxMaturationTemperature: 40,
  minMaturationHumidity: 40,
  maxMaturationHumidity: 50,
  minMaturationMinutes: 50000,
  maxMaturationMinutes: 60000,
};

const sensorReadsToReturn: SensorReads = {
  curd: [{ datetime: new Date(), temperature: 15 }],
  salting: [{ datetime: new Date(), salinity: 25 }],
  maturation: [{ datetime: new Date(), temperature: 35, humidity: 45 }],
};

const dairyToReturn: Omit<DairyWithBatches, "rut"> = {
  name: faker.company.name(),
  registrationCode: null,
  bromatologicalRegistry: null,
  companyNumber: null,
  dicoseNumber: null,
  address: null,
  contactPhone: null,
  createdAt: faker.date.recent({ days: 3000 }),
  enabledSince: null,
  endorsementDate: null,
  producerId: faker.string.uuid(),
  batches: [],
  department: "SanJose",
};

const batchToReturn: BatchWithDairy = {
  id: batchId,
  dairyRut: rut,

  batchName,
  curdInitDateTime: null,
  curdEndDateTime: null,
  saltingInitDateTime: null,
  maturationInitDateTime: null,
  maturationEndDateTime: null,
  initialVolume: null,
  weightBeforeSalting: null,
  weightAfterMaturation: null,
  blockchainCertificationId: null,

  cheeseTypeName,
  certified: "WaitingReview",
  started: false,
  createdAt: faker.date.recent({ days: 3000 }),

  dairy: { ...dairyToReturn, rut },
  dairyCheeseType: {
    cheeseTypeName,
    dairyRut: rut,
  },
};

const weightAfterMaturation = faker.number.float({ min: 0, max: 5000 });

/**
 * Before tests
 */
beforeEach(() => {
  createBatches.mockReset().mockImplementation((input) =>
    Promise.resolve(
      Array.from({ length: input.amount }, (_, index) => ({
        id: index.toString(),
      }))
    )
  );

  getCheeseTypeByDairyRut
    .mockReset()
    .mockImplementation(() => Promise.resolve("Colonia"));

  getDairyWithBatchesByRut
    .mockReset()
    .mockImplementation((dairyRut) =>
      Promise.resolve({ ...dairyToReturn, rut: dairyRut })
    );

  updateBatch
    .mockReset()
    .mockImplementation(() => Promise.resolve(batchToReturn));
});

/**
 * Tests
 */
describe("BatchController::createBatches - successFlow", () => {
  it("Should call the repositories with the correct information", async () => {
    await batchController.createBatches(batchesToCreate, baseUrl);

    expect(createBatches.mock.calls).toEqual(
      batchesToCreate.map((batchesToCreateForDairy) => [
        {
          ...batchesToCreateForDairy,
          cheeseTypeName: expect.any(String),
        },
      ])
    );

    expect(getCheeseTypeByDairyRut.mock.calls).toEqual(
      batchesToCreate.map((batchesToCreateForDairy) => [
        batchesToCreateForDairy.dairyRut,
      ])
    );

    expect(getDairyWithBatchesByRut.mock.calls).toEqual(
      batchesToCreate.map((batchesToCreateForDairy) => [
        batchesToCreateForDairy.dairyRut,
      ])
    );
  });

  it("Should obtain the created batches urls", async () => {
    const urls = await batchController.createBatches(batchesToCreate, baseUrl);

    Object.entries(urls).forEach((dairyUrls, index) => {
      const batchToCreate = batchesToCreate[index];
      if (!batchToCreate) throw new Error("Batches info not found");

      const rutAsString = dairyUrls[0];
      expect(rutAsString).toBe(batchToCreate.dairyRut.toString());

      const urls = dairyUrls[1];
      expect(urls).toHaveLength(batchToCreate.amount);

      urls.forEach((urlInfo) => {
        expect(urlInfo.url).toContain("/producer/batch?token=");
        expect(urlInfo.tagKeys.dairyName).toEqual(expect.any(String));
        expect(urlInfo.tagKeys.batchNumber).toBeGreaterThan(0);
      });
    });
  });
});

describe("BatchController::createBatches - errorFlow", () => {
  it("Should require the dairyRepository", async () => {
    const batchController = new BatchController({
      batchRepository,
      // dairyRepository,
      tokenObtainer,
    });

    await expect(
      batchController.createBatches(batchesToCreate, baseUrl)
    ).rejects.toStrictEqual(new PreconditionError("Dairy repository expected"));
  });

  it("Should require the tokenObtainer", async () => {
    const batchController = new BatchController({
      batchRepository,
      dairyRepository,
      // tokenObtainer,
    });

    await expect(
      batchController.createBatches(batchesToCreate, baseUrl)
    ).rejects.toStrictEqual(new PreconditionError("Token obtainer expected"));
  });

  it("Should only accept positive amounts", async () => {
    await expect(
      batchController.createBatches(
        [
          {
            amount: 0,
            dairyRut: 100000000000,
          },
        ],
        baseUrl
      )
    ).rejects.toStrictEqual(new ConsistencyError("Amount should be positive"));
  });
});

describe("BatchController::startBatch - successFlow", () => {
  it("Should call the repositories with the correct information", async () => {
    await batchController.startBatch(batchId, cheeseTypeName, batchName);

    expect(updateBatch).toBeCalledWith({
      batchId,
      cheeseTypeName,
      batchName,
      started: true,
    });
  });

  it("Should obtain the updated batch with the current step", async () => {
    const updatedBatch = await batchController.startBatch(
      batchId,
      cheeseTypeName,
      batchName
    );

    expect(updatedBatch).toBe(batchToReturn);
    expect(updatedBatch.currentStep).toBe("NotStarted");
    expect(updatedBatch.currentStepDateTime).toBeUndefined();
  });
});

describe("BatchController::finishBatch - successFlow", () => {
  /**
   * Finish batch parameters and functions
   */
  const now = new Date();
  const oneMinuteInMS = 1000 * 60;

  const curdMinutes =
    (cheeseTypeToReturn.maxCurdMinutes - cheeseTypeToReturn.minCurdMinutes) /
      2 +
    cheeseTypeToReturn.minCurdMinutes;

  const minutesBetweenEndCurdAndInitSalting = 10;

  const saltingMinutes =
    (cheeseTypeToReturn.maxSaltingMinutes -
      cheeseTypeToReturn.minSaltingMinutes) /
      2 +
    cheeseTypeToReturn.minSaltingMinutes;

  const maturationMinutes =
    (cheeseTypeToReturn.maxMaturationMinutes -
      cheeseTypeToReturn.minMaturationMinutes) /
      2 +
    cheeseTypeToReturn.minMaturationMinutes;

  const maturationInitDateTime = new Date(
    now.getTime() - oneMinuteInMS * maturationMinutes // This is because when finish a batch the endMaturationTime is "now" so we have to force it to start in: "now - maturation minutes".
  );

  const saltingInitDateTime = new Date(
    maturationInitDateTime.getTime() - oneMinuteInMS * saltingMinutes
  );

  const curdEndDateTime = new Date(
    saltingInitDateTime.getTime() -
      oneMinuteInMS * minutesBetweenEndCurdAndInitSalting
  );

  const curdInitDateTime = new Date(
    curdEndDateTime.getTime() - oneMinuteInMS * curdMinutes
  );

  const almostFinishedBatch: BatchWithDairy = {
    id: "almostFinishedBatch",
    dairyRut: rut,

    batchName: "almostFinishedBatch",
    curdInitDateTime,
    curdEndDateTime,
    saltingInitDateTime,
    maturationInitDateTime,
    maturationEndDateTime: null,
    initialVolume: null,
    weightBeforeSalting: null,
    weightAfterMaturation: null,
    blockchainCertificationId: null,

    cheeseTypeName,
    certified: "WaitingReview",
    started: true,
    createdAt: new Date(2023, 5, 16, 6, 30),

    dairy: { ...dairyToReturn, rut },
    dairyCheeseType: {
      cheeseTypeName,
      dairyRut: rut,
    },
  };

  const curdTimeTolerancePercentage = 10;
  const saltingTimeTolerancePercentage = 10;
  const maturationTimeTolerancePercentage = 15;
  const curdTemperatureTolerancePercentage = 5;
  const saltingSalinityTolerancePercentage = 10;
  const maturationTemperatureTolerancePercentage = 20;
  const maturationHumidityTolerancePercentage = 2;

  const maxAdmissibleErrors = 5;

  const updateBatchSuccessfulInput = {
    batchId,
    maturationEndDateTime: expect.any(Date),
    weightAfterMaturation,
    certified: "SuccessfullyCertified",
  };

  const updateBatchFailInput = {
    ...updateBatchSuccessfulInput,
    certified: "CertificationFailed",
  };

  const getReadsWithAdmissibleFailForCurd = (
    cheeseType: CheeseType,
    readAmount: number
  ) =>
    Array.from({ length: readAmount }, () => ({
      datetime: new Date(),
      temperature:
        cheeseType.maxCurdTemperature *
        (1 + curdTemperatureTolerancePercentage / (100 * 2)),
    }));

  const getReadsWithAdmissibleFailForSalting = (
    cheeseType: CheeseType,
    readAmount: number
  ) =>
    Array.from({ length: readAmount }, () => ({
      datetime: new Date(),
      salinity:
        cheeseType.minSaltingSalinity *
        (1 - maturationTemperatureTolerancePercentage / (100 * 2)),
    }));

  const getReadsWithAdmissibleFailForMaturation = (
    cheeseType: CheeseType,
    readAmount: number,
    datetime = new Date()
  ) =>
    Array.from({ length: readAmount }, () => ({
      datetime,
      temperature:
        cheeseType.maxMaturationTemperature *
        (1 + maturationTemperatureTolerancePercentage / (100 * 2)),
      humidity:
        cheeseType.maxMaturationHumidity -
        (cheeseType.maxMaturationHumidity - cheeseType.minMaturationHumidity) /
          2, // Not failing humidity
    }));

  beforeEach(() => {
    getBatchById
      .mockReset()
      .mockImplementation(() => Promise.resolve({ ...almostFinishedBatch }));

    updateBatch.mockReset().mockImplementation((input) =>
      Promise.resolve({
        ...almostFinishedBatch,
        maturationEndDateTime: input.maturationEndDateTime ?? null,
      })
    );

    getCheeseType
      .mockReset()
      .mockImplementation(() => Promise.resolve(cheeseTypeToReturn));

    getSensorReads
      .mockReset()
      .mockImplementation(() => Promise.resolve(sensorReadsToReturn));
  });

  /**
   * Tests
   */

  it("Should call the repositories with the correct information", async () => {
    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(getBatchById).toBeCalledWith(batchId);

    expect(updateBatch).toBeCalledWith({
      batchId,
      maturationEndDateTime: expect.any(Date),
      weightAfterMaturation,
      certified: expect.any(String),
    });

    expect(getSensorReads).toBeCalledWith({
      curdEndDateTime: almostFinishedBatch.curdEndDateTime,
      curdInitDateTime: almostFinishedBatch.curdInitDateTime,
      dairyRut: almostFinishedBatch.dairyRut,
      maturationEndDateTime: expect.any(Date),
      maturationInitDateTime: almostFinishedBatch.maturationInitDateTime,
      saltingEndDateTime: almostFinishedBatch.maturationInitDateTime,
      saltingInitDateTime: almostFinishedBatch.saltingInitDateTime,
    });
  });

  it("Should obtain the finished batch with the current step", async () => {
    const updatedBatch = await batchController.finishBatch(
      batchId,
      weightAfterMaturation
    );

    expect(updatedBatch).toStrictEqual({
      ...almostFinishedBatch,
      currentStep: "Finished",
      currentStepDateTime: expect.any(Date),
      maturationEndDateTime: expect.any(Date),
    });
  });

  /**
   * Successfully certification tests
   */
  it("Should certify: no admissible or inadmissible fails", async () => {
    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith(updateBatchSuccessfulInput);
  });

  it("Should certify: less than maximum admissible fails (same sensor reads) and no inadmissible fail", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          ...getReadsWithAdmissibleFailForMaturation(
            cheeseTypeToReturn,
            faker.number.int({
              min: Math.ceil(maxAdmissibleErrors / 2),
              max: maxAdmissibleErrors,
            })
          ),
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith(updateBatchSuccessfulInput);
  });

  it("Should certify: less than maximum admissible fails (mixed time and reads) and no inadmissible fail", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        curd: [
          ...sensorReadsToReturn.curd,
          ...getReadsWithAdmissibleFailForCurd(cheeseTypeToReturn, 1),
        ],
        salting: [
          ...sensorReadsToReturn.salting,
          ...getReadsWithAdmissibleFailForSalting(cheeseTypeToReturn, 1),
        ],
        maturation: [
          ...sensorReadsToReturn.maturation,
          ...getReadsWithAdmissibleFailForMaturation(cheeseTypeToReturn, 1),
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith(updateBatchSuccessfulInput);
  });

  it("Should certify: equal to maximum admissible fails and no inadmissible fail", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        curd: [
          ...sensorReadsToReturn.curd,
          ...getReadsWithAdmissibleFailForCurd(cheeseTypeToReturn, 1),
        ],
        salting: [
          ...sensorReadsToReturn.salting,
          ...getReadsWithAdmissibleFailForSalting(cheeseTypeToReturn, 1),
        ],
        maturation: [
          ...sensorReadsToReturn.maturation,
          ...getReadsWithAdmissibleFailForMaturation(
            cheeseTypeToReturn,
            maxAdmissibleErrors - 2
          ),
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith(updateBatchSuccessfulInput);
  });

  it("Should certify: times equal than maximum admissible", async () => {
    const innerMaturationMinutes =
      cheeseTypeToReturn.maxMaturationMinutes *
        (1 + maturationTimeTolerancePercentage / 100) -
      1; // -1 to prevent failing because the diff between the "now" of the test and the one of the BatchController::finishBatch function.

    const innerMaturationInitDateTime = new Date(
      now.getTime() - oneMinuteInMS * innerMaturationMinutes
    );

    const innerSaltingInitDateTime = new Date(
      innerMaturationInitDateTime.getTime() -
        oneMinuteInMS *
          cheeseTypeToReturn.maxSaltingMinutes *
          (1 + saltingTimeTolerancePercentage / 100)
    );

    const innerCurdEndDateTime = new Date(
      innerSaltingInitDateTime.getTime() -
        oneMinuteInMS * minutesBetweenEndCurdAndInitSalting
    );

    const innerCurdInitDateTime = new Date(
      innerCurdEndDateTime.getTime() -
        oneMinuteInMS *
          cheeseTypeToReturn.maxCurdMinutes *
          (1 + curdTimeTolerancePercentage / 100)
    );

    getBatchById.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...almostFinishedBatch,
        curdInitDateTime: innerCurdInitDateTime,
        curdEndDateTime: innerCurdEndDateTime,
        saltingInitDateTime: innerSaltingInitDateTime,
        maturationInitDateTime: innerMaturationInitDateTime,
      })
    );
    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith(updateBatchSuccessfulInput);
  });

  it("Should certify: times equal than minimum admissible", async () => {
    const innerMaturationMinutes =
      cheeseTypeToReturn.minMaturationMinutes *
        (1 + maturationTimeTolerancePercentage / 100) +
      1; // +1 to prevent failing because the diff between the "now" of the test and the one of the BatchController::finishBatch function.

    const innerMaturationInitDateTime = new Date(
      now.getTime() - oneMinuteInMS * innerMaturationMinutes
    );

    const innerSaltingInitDateTime = new Date(
      innerMaturationInitDateTime.getTime() -
        oneMinuteInMS *
          cheeseTypeToReturn.minSaltingMinutes *
          (1 + saltingTimeTolerancePercentage / 100)
    );

    const innerCurdEndDateTime = new Date(
      innerSaltingInitDateTime.getTime() -
        oneMinuteInMS * minutesBetweenEndCurdAndInitSalting
    );

    const innerCurdInitDateTime = new Date(
      innerCurdEndDateTime.getTime() -
        oneMinuteInMS *
          cheeseTypeToReturn.minCurdMinutes *
          (1 + curdTimeTolerancePercentage / 100)
    );

    getBatchById.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...almostFinishedBatch,
        curdInitDateTime: innerCurdInitDateTime,
        curdEndDateTime: innerCurdEndDateTime,
        saltingInitDateTime: innerSaltingInitDateTime,
        maturationInitDateTime: innerMaturationInitDateTime,
      })
    );
    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith(updateBatchSuccessfulInput);
  });

  it("Should certify: when a read value is equal to minimum/maximum allowed", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          ...Array.from({ length: maxAdmissibleErrors + 1 }, () => ({
            datetime: new Date(),
            temperature: cheeseTypeToReturn.maxMaturationTemperature,
            humidity: cheeseTypeToReturn.minMaturationHumidity,
          })),
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith(updateBatchSuccessfulInput);
  });

  /**
   * Failed certification tests
   */
  it("Should not certify: curd time less than minimum admissible", async () => {
    const innerCurdInitDateTime = almostFinishedBatch.curdInitDateTime;
    if (!innerCurdInitDateTime) throw new Error("Test precondition failed");

    const usingMinutes =
      cheeseTypeToReturn.minCurdMinutes *
        (1 - curdTimeTolerancePercentage / 100) -
      1; // -1 to have less than minimum

    const innerCurdEndDateTime = new Date(
      innerCurdInitDateTime.getTime() + oneMinuteInMS * usingMinutes
    );

    getBatchById.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...almostFinishedBatch,
        curdEndDateTime: innerCurdEndDateTime,
      })
    );
    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedMinutes = parseFloat(usingMinutes.toFixed(1));

    const fail: CertificationFail = {
      message: `El tiempo de coagulación y cocción fue de ${parsedMinutes} minutos y debe ser mayor o igual que ${cheeseTypeToReturn.minCurdMinutes} minutos`,
      failType: EnumFailTypes.curdMinTimeInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: curd time more than maximum admissible", async () => {
    const innerCurdInitDateTime = almostFinishedBatch.curdInitDateTime;
    if (!innerCurdInitDateTime) throw new Error("Test precondition failed");

    const usingMinutes =
      cheeseTypeToReturn.maxCurdMinutes *
        (1 + curdTimeTolerancePercentage / 100) +
      1; // +1 to have more than maximum

    const innerCurdEndDateTime = new Date(
      innerCurdInitDateTime.getTime() + oneMinuteInMS * usingMinutes
    );

    getBatchById.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...almostFinishedBatch,
        curdEndDateTime: innerCurdEndDateTime,
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedMinutes = parseFloat(usingMinutes.toFixed(1));

    const fail: CertificationFail = {
      message: `El tiempo de coagulación y cocción fue de ${parsedMinutes} minutos y debe ser menor o igual que ${cheeseTypeToReturn.maxCurdMinutes} minutos`,
      failType: EnumFailTypes.curdMaxTimeInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: salting time less than minimum admissible", async () => {
    const innerSaltingInitDateTime = almostFinishedBatch.saltingInitDateTime;
    if (!innerSaltingInitDateTime) throw new Error("Test precondition failed");

    const usingMinutes =
      cheeseTypeToReturn.minSaltingMinutes *
        (1 - saltingTimeTolerancePercentage / 100) -
      1; // -1 to have less than minimum

    const innerSaltingEndDateTime = new Date(
      innerSaltingInitDateTime.getTime() + oneMinuteInMS * usingMinutes
    );

    getBatchById.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...almostFinishedBatch,
        maturationInitDateTime: innerSaltingEndDateTime,
      })
    );
    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedMinutes = parseFloat(usingMinutes.toFixed(1));

    const fail: CertificationFail = {
      message: `El tiempo de salmuera fue de ${parsedMinutes} minutos y debe ser mayor o igual que ${cheeseTypeToReturn.minSaltingMinutes} minutos`,
      failType: EnumFailTypes.saltingMinTimeInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: salting time more than maximum admissible", async () => {
    const innerSaltingInitDateTime = almostFinishedBatch.saltingInitDateTime;
    if (!innerSaltingInitDateTime) throw new Error("Test precondition failed");

    const usingMinutes =
      cheeseTypeToReturn.maxSaltingMinutes *
        (1 + saltingTimeTolerancePercentage / 100) +
      1; // +1 to have more than maximum

    const innerSaltingEndDateTime = new Date(
      innerSaltingInitDateTime.getTime() + oneMinuteInMS * usingMinutes
    );

    getBatchById.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...almostFinishedBatch,
        maturationInitDateTime: innerSaltingEndDateTime,
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedMinutes = parseFloat(usingMinutes.toFixed(1));

    const fail: CertificationFail = {
      message: `El tiempo de salmuera fue de ${parsedMinutes} minutos y debe ser menor o igual que ${cheeseTypeToReturn.maxSaltingMinutes} minutos`,
      failType: EnumFailTypes.saltingMaxTimeInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: maturation time less than minimum admissible", async () => {
    const usingMinutes =
      cheeseTypeToReturn.minMaturationMinutes *
        (1 - maturationTimeTolerancePercentage / 100) -
      1; // -1 to have less than minimum

    const innerMaturationInitDateTime = new Date(
      now.getTime() - oneMinuteInMS * usingMinutes
    );

    const innerSaltingInitDateTime = new Date(
      innerMaturationInitDateTime.getTime() - oneMinuteInMS * saltingMinutes
    );

    const innerCurdEndDateTime = new Date(
      innerSaltingInitDateTime.getTime() -
        oneMinuteInMS * minutesBetweenEndCurdAndInitSalting
    );

    const innerCurdInitDateTime = new Date(
      innerCurdEndDateTime.getTime() - oneMinuteInMS * curdMinutes
    );

    getBatchById.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...almostFinishedBatch,
        curdInitDateTime: innerCurdInitDateTime,
        curdEndDateTime: innerCurdEndDateTime,
        saltingInitDateTime: innerSaltingInitDateTime,
        maturationInitDateTime: innerMaturationInitDateTime,
      })
    );
    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedMinutes = parseFloat(usingMinutes.toFixed(1));

    const fail: CertificationFail = {
      message: `El tiempo de maduración fue de ${parsedMinutes} minutos y debe ser mayor o igual que ${cheeseTypeToReturn.minMaturationMinutes} minutos`,
      failType: EnumFailTypes.maturationMinTimeInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: maturation time more than maximum admissible", async () => {
    const usingMinutes =
      cheeseTypeToReturn.maxMaturationMinutes *
        (1 + maturationTimeTolerancePercentage / 100) +
      1; // +1 to have more than maximum

    const innerMaturationInitDateTime = new Date(
      now.getTime() - oneMinuteInMS * usingMinutes
    );

    const innerSaltingInitDateTime = new Date(
      innerMaturationInitDateTime.getTime() - oneMinuteInMS * saltingMinutes
    );

    const innerCurdEndDateTime = new Date(
      innerSaltingInitDateTime.getTime() -
        oneMinuteInMS * minutesBetweenEndCurdAndInitSalting
    );

    const innerCurdInitDateTime = new Date(
      innerCurdEndDateTime.getTime() - oneMinuteInMS * curdMinutes
    );

    getBatchById.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...almostFinishedBatch,
        curdInitDateTime: innerCurdInitDateTime,
        curdEndDateTime: innerCurdEndDateTime,
        saltingInitDateTime: innerSaltingInitDateTime,
        maturationInitDateTime: innerMaturationInitDateTime,
      })
    );
    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedMinutes = parseFloat(usingMinutes.toFixed(1));

    const fail: CertificationFail = {
      message: `El tiempo de maduración fue de ${parsedMinutes} minutos y debe ser menor o igual que ${cheeseTypeToReturn.maxMaturationMinutes} minutos`,
      failType: EnumFailTypes.maturationMaxTimeInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: curd temperature less than minimum admissible", async () => {
    const datetime = new Date();
    const temperature =
      cheeseTypeToReturn.minCurdTemperature *
        (1 - curdTemperatureTolerancePercentage / 100) -
      1;

    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        curd: [
          ...sensorReadsToReturn.curd,
          {
            datetime,
            temperature,
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedTemperature = parseFloat(temperature.toFixed(1));

    const fail: CertificationFail = {
      message: `La temperatura en la coagulación y cocción fue de ${parsedTemperature} y el mínimo permitido es ${
        cheeseTypeToReturn.minCurdTemperature
      }, en la lectura del ${format(datetime, "dd/MM/yyyy HH:mm")}`,
      failType: EnumFailTypes.curdMinTemperatureInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });
  it("Should not certify: curd temperature more than maximum admissible", async () => {
    const datetime = new Date();
    const temperature =
      cheeseTypeToReturn.maxCurdTemperature *
        (1 + curdTemperatureTolerancePercentage / 100) +
      1;

    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        curd: [
          ...sensorReadsToReturn.curd,
          {
            datetime,
            temperature,
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedTemperature = parseFloat(temperature.toFixed(1));

    const fail: CertificationFail = {
      message: `La temperatura en la coagulación y cocción fue de ${parsedTemperature} y el máximo permitido es ${
        cheeseTypeToReturn.maxCurdTemperature
      }, en la lectura del ${format(datetime, "dd/MM/yyyy HH:mm")}`,
      failType: EnumFailTypes.curdMaxTemperatureInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: salting salinity less than minimum admissible", async () => {
    const datetime = new Date();
    const salinity =
      cheeseTypeToReturn.minSaltingSalinity *
        (1 - saltingSalinityTolerancePercentage / 100) -
      1;

    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        salting: [
          ...sensorReadsToReturn.salting,
          {
            datetime,
            salinity,
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedSalinity = parseFloat(salinity.toFixed(1));

    const fail: CertificationFail = {
      message: `La salinidad en la salmuera fue de ${parsedSalinity} y el mínimo permitido es ${
        cheeseTypeToReturn.minSaltingSalinity
      }, en la lectura del ${format(datetime, "dd/MM/yyyy HH:mm")}`,
      failType: EnumFailTypes.saltingMinSalinityInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });
  it("Should not certify: salting salinity more than maximum admissible", async () => {
    const datetime = new Date();
    const salinity =
      cheeseTypeToReturn.maxSaltingSalinity *
        (1 + saltingSalinityTolerancePercentage / 100) +
      1;

    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        salting: [
          ...sensorReadsToReturn.salting,
          {
            datetime,
            salinity,
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedSalinity = parseFloat(salinity.toFixed(1));

    const fail: CertificationFail = {
      message: `La salinidad en la salmuera fue de ${parsedSalinity} y el máximo permitido es ${
        cheeseTypeToReturn.maxSaltingSalinity
      }, en la lectura del ${format(datetime, "dd/MM/yyyy HH:mm")}`,
      failType: EnumFailTypes.saltingMaxSalinityInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: maturation temperature less than minimum admissible", async () => {
    const datetime = new Date();
    const temperature =
      cheeseTypeToReturn.minMaturationTemperature *
        (1 - maturationTemperatureTolerancePercentage / 100) -
      1;
    const humidity = cheeseTypeToReturn.minMaturationHumidity;

    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          {
            datetime,
            temperature,
            humidity,
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedTemperature = parseFloat(temperature.toFixed(1));

    const fail: CertificationFail = {
      message: `La temperatura en la maduración fue de ${parsedTemperature} y el mínimo permitido es ${
        cheeseTypeToReturn.minMaturationTemperature
      }, en la lectura del ${format(datetime, "dd/MM/yyyy HH:mm")}`,
      failType: EnumFailTypes.maturationMinTemperatureInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });
  it("Should not certify: maturation temperature more than maximum admissible", async () => {
    const datetime = new Date();
    const temperature =
      cheeseTypeToReturn.maxMaturationTemperature *
        (1 + maturationTemperatureTolerancePercentage / 100) +
      1;
    const humidity = cheeseTypeToReturn.minMaturationHumidity;

    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          {
            datetime,
            temperature,
            humidity,
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedTemperature = parseFloat(temperature.toFixed(1));

    const fail: CertificationFail = {
      message: `La temperatura en la maduración fue de ${parsedTemperature} y el máximo permitido es ${
        cheeseTypeToReturn.maxMaturationTemperature
      }, en la lectura del ${format(datetime, "dd/MM/yyyy HH:mm")}`,
      failType: EnumFailTypes.maturationMaxTemperatureInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: maturation humidity less than minimum admissible", async () => {
    const datetime = new Date();
    const temperature = cheeseTypeToReturn.minMaturationTemperature;
    const humidity =
      cheeseTypeToReturn.minMaturationHumidity *
        (1 - maturationHumidityTolerancePercentage / 100) -
      1;

    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          {
            datetime,
            temperature,
            humidity,
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedHumidity = parseFloat(humidity.toFixed(1));

    const fail: CertificationFail = {
      message: `La humedad en la maduración fue de ${parsedHumidity} y el mínimo permitido es ${
        cheeseTypeToReturn.minMaturationHumidity
      }, en la lectura del ${format(datetime, "dd/MM/yyyy HH:mm")}`,
      failType: EnumFailTypes.maturationMinHumidityInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });
  it("Should not certify: maturation humidity more than maximum admissible", async () => {
    const datetime = new Date();
    const temperature = cheeseTypeToReturn.minMaturationTemperature;
    const humidity =
      cheeseTypeToReturn.maxMaturationHumidity *
        (1 + maturationHumidityTolerancePercentage / 100) +
      1;

    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          {
            datetime,
            temperature,
            humidity,
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const parsedHumidity = parseFloat(humidity.toFixed(1));

    const fail: CertificationFail = {
      message: `La humedad en la maduración fue de ${parsedHumidity} y el máximo permitido es ${
        cheeseTypeToReturn.maxMaturationHumidity
      }, en la lectura del ${format(datetime, "dd/MM/yyyy HH:mm")}`,
      failType: EnumFailTypes.maturationMaxHumidityInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should not certify: more than maximum admissible fails and no inadmissible fail", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          ...getReadsWithAdmissibleFailForMaturation(
            cheeseTypeToReturn,
            faker.number.int({
              min: maxAdmissibleErrors + 1,
              max: maxAdmissibleErrors * 2,
            })
          ),
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: expect.any(Array),
    });

    const parsedCertificationMessage =
      updateBatch.mock.calls[0]?.[0].certificationMessages ?? [];
    expect(parsedCertificationMessage.length).toBe(maxAdmissibleErrors + 1);
  });
  it("Should not certify: more than maximum admissible fails first and an inadmissible fail later", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        curd: [
          ...sensorReadsToReturn.curd,
          ...getReadsWithAdmissibleFailForCurd(
            cheeseTypeToReturn,
            faker.number.int({
              min: maxAdmissibleErrors + 1,
              max: maxAdmissibleErrors * 2,
            })
          ),
        ],
        maturation: [
          ...sensorReadsToReturn.maturation,
          {
            datetime: new Date(),
            temperature:
              cheeseTypeToReturn.maxMaturationTemperature *
                (1 + maturationTemperatureTolerancePercentage / 100) +
              1, // +1 to be inadmissible
            humidity:
              cheeseTypeToReturn.maxMaturationHumidity -
              (cheeseTypeToReturn.maxMaturationHumidity -
                cheeseTypeToReturn.minMaturationHumidity) /
                2, // Not failing humidity
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: expect.any(Array),
    });

    const parsedCertificationMessage =
      updateBatch.mock.calls[0]?.[0].certificationMessages ?? [];
    expect(parsedCertificationMessage.length).toBe(maxAdmissibleErrors + 1);
  });
  it("Should not certify: more than maximum admissible fails later than an inadmissible fail", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          {
            datetime: new Date(),
            temperature:
              cheeseTypeToReturn.maxMaturationTemperature *
                (1 + maturationTemperatureTolerancePercentage / 100) +
              1, // +1 to be inadmissible
            humidity:
              cheeseTypeToReturn.maxMaturationHumidity -
              (cheeseTypeToReturn.maxMaturationHumidity -
                cheeseTypeToReturn.minMaturationHumidity) /
                2, // Not failing humidity
          },
          ...getReadsWithAdmissibleFailForMaturation(
            cheeseTypeToReturn,
            faker.number.int({
              min: maxAdmissibleErrors + 1,
              max: maxAdmissibleErrors * 2,
            })
          ),
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: expect.any(Array),
    });

    const parsedCertificationMessage =
      updateBatch.mock.calls[0]?.[0].certificationMessages ?? [];
    expect(parsedCertificationMessage.length).toBe(1);
  });
  it("Should not certify: equal or less to maximum admissible fails and an inadmissible fail", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        curd: [
          ...sensorReadsToReturn.curd,
          ...getReadsWithAdmissibleFailForCurd(
            cheeseTypeToReturn,
            faker.number.int({ min: 0, max: maxAdmissibleErrors })
          ),
        ],
        maturation: [
          ...sensorReadsToReturn.maturation,
          {
            datetime: new Date(),
            temperature:
              cheeseTypeToReturn.maxMaturationTemperature *
                (1 + maturationTemperatureTolerancePercentage / 100) +
              1, // +1 to be inadmissible
            humidity:
              cheeseTypeToReturn.maxMaturationHumidity -
              (cheeseTypeToReturn.maxMaturationHumidity -
                cheeseTypeToReturn.minMaturationHumidity) /
                2, // Not failing humidity
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: expect.any(Array),
    });

    const parsedCertificationMessage =
      updateBatch.mock.calls[0]?.[0].certificationMessages ?? [];
    expect(parsedCertificationMessage.length).toBe(1);
  });

  it("Should not certify: more than one inadmissible fails", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          {
            datetime: new Date(),
            temperature:
              cheeseTypeToReturn.maxMaturationTemperature *
                (1 + maturationTemperatureTolerancePercentage / 100) +
              1, // +1 to be inadmissible
            humidity:
              cheeseTypeToReturn.maxMaturationHumidity -
              (cheeseTypeToReturn.maxMaturationHumidity -
                cheeseTypeToReturn.minMaturationHumidity) /
                2, // Not failing humidity
          },
          {
            datetime: new Date(),
            temperature:
              cheeseTypeToReturn.maxMaturationTemperature *
                (1 + maturationTemperatureTolerancePercentage / 100) +
              1, // +1 to be inadmissible
            humidity:
              cheeseTypeToReturn.maxMaturationHumidity -
              (cheeseTypeToReturn.maxMaturationHumidity -
                cheeseTypeToReturn.minMaturationHumidity) /
                2, // Not failing humidity
          },
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: expect.any(Array),
    });

    const parsedCertificationMessage =
      updateBatch.mock.calls[0]?.[0].certificationMessages ?? [];
    expect(parsedCertificationMessage.length).toBe(1);
  });

  it("Should not certify: no curd reads", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        curd: [],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const fail: CertificationFail = {
      message: "No se encontraron lecturas en la coagulación y cocción",
      failType: EnumFailTypes.curdNoReadsInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });
  it("Should not certify: no salting reads", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        salting: [],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const fail: CertificationFail = {
      message: "No se encontraron lecturas en la salmuera",
      failType: EnumFailTypes.saltingNoReadsInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });
  it("Should not certify: no maturation reads", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    const fail: CertificationFail = {
      message: "No se encontraron lecturas en la maduración",
      failType: EnumFailTypes.maturationNoReadsInadmissible,
    };
    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: [fail],
    });
  });

  it("Should bring the first [maxAdmissible + 1] messages when 10 more than maxAdmissible fails happen", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          ...getReadsWithAdmissibleFailForMaturation(
            cheeseTypeToReturn,
            maxAdmissibleErrors + 10
          ),
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: expect.any(Array),
    });

    const parsedCertificationMessage =
      updateBatch.mock.calls[0]?.[0].certificationMessages ?? [];
    expect(parsedCertificationMessage.length).toBe(maxAdmissibleErrors + 1);
  });

  it("Should consider admissible fail when the value is equal to minimum/maximum admissible", async () => {
    getSensorReads.mockReset().mockImplementation(() =>
      Promise.resolve({
        ...sensorReadsToReturn,
        maturation: [
          ...sensorReadsToReturn.maturation,
          ...Array.from({ length: maxAdmissibleErrors + 1 }, () => ({
            datetime: new Date(),
            temperature:
              cheeseTypeToReturn.maxMaturationTemperature *
              (1 + maturationTemperatureTolerancePercentage / 100),
            humidity: cheeseTypeToReturn.minMaturationHumidity,
          })),
        ],
      })
    );

    await batchController.finishBatch(batchId, weightAfterMaturation);

    expect(updateBatch).toBeCalledWith({
      ...updateBatchFailInput,
      certificationMessages: expect.any(Array),
    });

    const parsedCertificationMessage =
      updateBatch.mock.calls[0]?.[0].certificationMessages ?? [];
    expect(parsedCertificationMessage.length).toBe(maxAdmissibleErrors + 1);
  });
});
