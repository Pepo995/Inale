import type {
  CurdAverageSensorReads,
  CurdRead,
  MaturationAverageSensorReads,
  MaturationRead,
  SaltingAverageSensorReads,
  SaltingRead,
  SensorReads,
} from "@types";

export interface ISensorRepository {
  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createCurdRead: (read: CurdRead) => Promise<void>;

  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createSaltingRead: (read: SaltingRead) => Promise<void>;

  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createMaturationRead: (read: MaturationRead) => Promise<void>;

  getSensorReads: (input: {
    dairyRut: number;
    curdInitDateTime: Date;
    curdEndDateTime: Date;
    saltingInitDateTime: Date;
    saltingEndDateTime: Date;
    maturationInitDateTime: Date;
    maturationEndDateTime: Date;
  }) => Promise<SensorReads>;

  getCurdSensorAverageReads: (input: {
    dairyRut: number;
    curdInitDateTime: Date;
    curdEndDateTime: Date;
  }) => Promise<CurdAverageSensorReads>;

  getSaltingSensorAverageReads: (input: {
    dairyRut: number;
    saltingInitDateTime: Date;
    saltingEndDateTime: Date;
  }) => Promise<SaltingAverageSensorReads>;

  getMaturationSensorAverageReads: (input: {
    dairyRut: number;
    maturationInitDateTime: Date;
    maturationEndDateTime: Date;
  }) => Promise<MaturationAverageSensorReads>;

  getSensorReadsByDairyRutAndDateRange: (input: {
    dairyRut: number;
    minDate: Date;
    maxDate: Date;
  }) => Promise<SensorReads>;
}
