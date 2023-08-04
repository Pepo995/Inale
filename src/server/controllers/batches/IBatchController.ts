import type {
  Batch,
  Dairy,
  DairyCheeseType,
  CreatedBatchesUrls,
  BatchWithDairy,
  CheeseType,
  BatchStats,
  BatchesPerMonth,
  CheeseTypeWeightStats,
} from "@types";

type BatchesToCreate = { amount: number; dairyRut: number }[];

export type BatchSensorDataWithCheeseType = {
  averageTemperatureInCurd: number | null;
  averageSalinityInSalting: number | null;
  averageTemperatureInMaturation: number | null;
  averageHumidityInMaturation: number | null;
  cheeseType: CheeseType;
  diffCurdMinutes: number | null;
  diffSaltingMinutes: number | null;
  diffMaturationMinutes: number | null;
  curdInitDateTime: Date | null;
  saltingInitDateTime: Date | null;
  maturationInitDateTime: Date | null;
};

export interface IBatchController {
  createBatches: (
    batches: BatchesToCreate,
    baseUrl: string
  ) => Promise<CreatedBatchesUrls>;

  /**
   * @pre blockchainRepository must be set
   * @throws NotFoundError
   * @throws PreconditionError
   */
  getBatchByToken: (token: string) => Promise<
    | Batch & {
        dairyCheeseType: DairyCheeseType;
        dairy: Dairy;
      }
  >;

  /**
   * @pre blockchainRepository must be set if batch.blockchainCertificationId is truthy.
   * @throws NotFoundError
   * @throws BlockchainError
   * @throws ConsistencyError
   */
  getBatchById: (id: string) => Promise<
    | Batch & {
        dairyCheeseType: DairyCheeseType;
        dairy: Dairy;
      }
  >;

  startBatch: (
    batchId: string,
    cheeseTypeName: string,
    batchName?: string
  ) => Promise<BatchWithDairy>;

  /**
   * @throws NotFoundError
   * @throws ConsistencyError
   */
  startCurd: (
    batchId: string,
    initialVolume?: number
  ) => Promise<BatchWithDairy>;

  /**
   * @throws NotFoundError
   * @throws ConsistencyError
   */
  finishCurd: (batchId: string) => Promise<Batch>;

  startSalting: (
    batchId: string,
    weightBeforeSalting?: number
  ) => Promise<Batch>;

  startMaturation: (batchId: string) => Promise<Batch>;

  /**
   * @pre sensorRepository must be set
   * @pre cheeseTypeRepository must be set
   * @pre blockchainRepository must be set
   * @throws PreconditionError
   * @throws NotFoundError
   * @throws ConsistencyError
   * @throws BlockchainError
   */
  finishBatch: (
    batchId: string,
    weightAfterMaturation?: number
  ) => Promise<Batch>;

  /**
   * @pre sensorRepository must be set
   * @pre cheeseTypeRepository must be set
   * @pre blockchainRepository must be set if input.maturationEndDateTime is truthy.
   * @throws PreconditionError
   * @throws ConsistencyError
   * @throws NotFoundError
   * @throws BlockchainError
   */
  updateSteps: (input: {
    batchId: string;
    initialVolume?: number;
    curdInitDateTime?: Date;
    curdEndDateTime?: Date;
    weightBeforeSalting?: number;
    saltingInitDateTime?: Date;
    maturationInitDateTime?: Date;
    maturationEndDateTime?: Date;
    weightAfterMaturation?: number;
  }) => Promise<Batch>;

  /**
   * @pre sensorRepository must be set
   * @pre cheeseTypeRepository must be set
   * @throws NotFoundError
   * @throws PreconditionError
   */
  getBatchSensorDataById: (
    batchId: string
  ) => Promise<BatchSensorDataWithCheeseType>;

  /**
   * @throws DatabaseError
   * @throws ConsistencyError
   */
  getBatchesByDateRange: (input: {
    minDate: Date;
    maxDate: Date;
    filter?: string;
    pagination?: { pageSize: number; page: number };
  }) => Promise<{ batches: BatchWithDairy[]; total: number }>;

  /**
   * @throws DatabaseError
   */
  getBatchesStats: () => Promise<BatchStats>;

  /**
   * @throws DatabaseError
   */
  getBatchesPerMonth: () => Promise<BatchesPerMonth>;

  /**
   * @throws DatabaseError
   */
  getCheeseTypesWeightStats: () => Promise<CheeseTypeWeightStats[]>;
}
