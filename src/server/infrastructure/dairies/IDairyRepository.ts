import type {
  DairyWithProducerAndEmployees,
  DairyCheeseType,
  DairyWithBatches,
  Dairy,
  Department,
  EnumFailTypes,
} from "@types";
import type { z } from "zod";
import type { dairySchema, updateDairySchema } from "@schemas";

export interface IDairyRepository {
  getAllDairiesWithProducerAndEmployees: (
    includeDeleted?: boolean
  ) => Promise<DairyWithProducerAndEmployees[]>;

  getAllDairies: (includeDeleted?: boolean) => Promise<Dairy[]>;

  /**
   * @throws NotFoundError
   */
  getDairyByRut: (rut: number) => Promise<DairyWithProducerAndEmployees>;

  getDairyCheeseTypesByRut: (dairyRut: number) => Promise<DairyCheeseType[]>;

  getDairyWithBatchesByRut: (dairyRut: number) => Promise<DairyWithBatches>;

  /**
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createDairy(
    input: z.infer<typeof dairySchema>
  ): Promise<DairyWithProducerAndEmployees>;

  updateDairyInfo(
    input: z.infer<typeof updateDairySchema>
  ): Promise<DairyWithProducerAndEmployees>;

  /**
   * @throws NotFoundError
   */
  deleteDairy: (rut: number) => Promise<DairyWithProducerAndEmployees>;

  /**
   * @throws NotFoundError
   */
  restoreDairy: (rut: number) => Promise<DairyWithProducerAndEmployees>;

  /**
   * @throws DatabaseError
   */
  getDairyLocationStats(): Promise<
    { department?: Department; amount: number }[]
  >;

  /**
   * @throws DatabaseError
   */
  getDairyFailedCertifications(
    rut: number,
    minDate: Date,
    maxDate: Date
  ): Promise<
    {
      failType: EnumFailTypes;
      amount: number;
    }[]
  >;
}
