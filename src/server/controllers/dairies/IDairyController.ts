import type {
  Dairy,
  DairyCheeseType,
  DairyWithProducerAndEmployees,
  Department,
  EnumFailTypes,
} from "@types";
import type { dairySchema, updateDairySchema } from "@schemas";
import type { z } from "zod";

export interface IDairyController {
  getAllDairiesWithProducerAndEmployees: (
    includeDeleted?: boolean
  ) => Promise<DairyWithProducerAndEmployees[]>;

  getAllDairies: (includeDeleted?: boolean) => Promise<Dairy[]>;

  /**
   * @throws NotFoundError
   */
  getDairyByRut(rut: number): Promise<DairyWithProducerAndEmployees>;

  getDairyCheeseTypesByRut: (dairyRut: number) => Promise<DairyCheeseType[]>;

  /**
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createDairy(
    input: z.infer<typeof dairySchema>
  ): Promise<DairyWithProducerAndEmployees>;

  /**
   * @throws NotFoundError
   */
  updateDairyInfo(
    input: z.infer<typeof updateDairySchema>
  ): Promise<DairyWithProducerAndEmployees | false>;

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
