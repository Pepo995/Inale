import type {
  BatchStats,
  BatchWithDairy,
  CertificationFail,
  Certified,
  CheeseTypeWeightStats,
} from "@types";

export interface IBatchRepository {
  createBatches: ({
    dairyRut,
    cheeseTypeName,
    amount,
  }: {
    dairyRut: number;
    cheeseTypeName: string;
    amount: number;
  }) => Promise<{ id: string }[]>;

  /**
   * @throws NotFoundError
   */
  getCheeseTypeByDairyRut: (dairyRut: number) => Promise<string>;

  /**
   * @throws NotFoundError
   */
  getBatchById: (batchId: string) => Promise<BatchWithDairy>;

  /**
   * @throws DatabaseError
   */
  updateBatch: (input: {
    batchId: string;
    batchName?: string;
    started?: boolean;
    cheeseTypeName?: string;
    initialVolume?: number;
    curdInitDateTime?: Date;
    curdEndDateTime?: Date;
    weightBeforeSalting?: number;
    saltingInitDateTime?: Date;
    maturationInitDateTime?: Date;
    maturationEndDateTime?: Date;
    weightAfterMaturation?: number;
    certified?: Certified;
    certificationMessages?: CertificationFail[];
    blockchainCertificationId?: string;
  }) => Promise<BatchWithDairy>;

  /**
   * @throws DatabaseError
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
  getCheeseTypesWeightStats: () => Promise<CheeseTypeWeightStats[]>;
}
