import type {
  CurdRead,
  MaturationRead,
  SaltingRead,
  SensorReadsCount,
} from "@types";

export interface ISensorController {
  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createCurdRead(read: CurdRead): Promise<void>;
  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createSaltingRead(read: SaltingRead): Promise<void>;
  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createMaturationRead(read: MaturationRead): Promise<void>;

  countLastWeekSensorReadsByDairy(input: {
    dairyRut: number;
  }): Promise<SensorReadsCount>;
}
