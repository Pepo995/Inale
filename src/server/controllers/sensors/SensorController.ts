import { type ISensorRepository } from "@infrastructure/sensors/ISensorRepository";
import { type ISensorController } from "./ISensorController";

class SensorController implements ISensorController {
  private sensorRepository;
  constructor(sensorRepository: ISensorRepository) {
    this.sensorRepository = sensorRepository;
  }

  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createCurdRead: ISensorController["createCurdRead"] = async (read) =>
    await this.sensorRepository.createCurdRead(read);

  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createSaltingRead: ISensorController["createSaltingRead"] = async (read) =>
    await this.sensorRepository.createSaltingRead(read);

  /**
   * @throws ForeignKeyFailedError
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createMaturationRead: ISensorController["createMaturationRead"] = async (
    read
  ) => await this.sensorRepository.createMaturationRead(read);

  countLastWeekSensorReadsByDairy: ISensorController["countLastWeekSensorReadsByDairy"] =
    async ({ dairyRut }) => {
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
      oneWeekAgo.setHours(0, 0, 0);
      today.setHours(23, 59, 59);

      const { curd, salting, maturation } =
        await this.sensorRepository.getSensorReadsByDairyRutAndDateRange({
          dairyRut,
          minDate: oneWeekAgo,
          maxDate: today,
        });

      const dailyCurdReads = curd.reduce(
        (acc, read) => {
          const date = read.datetime.getDay().toString();
          const curd = acc[date]?.curd ?? 1;
          const salting = acc[date]?.salting ?? 0;
          const maturation = acc[date]?.maturation ?? 0;
          acc[date] = { salting, curd: curd + 1, maturation };

          return acc;
        },
        {} as {
          [date: string]: { curd: number; salting: number; maturation: number };
        }
      );

      const dailySaltingReads = salting.reduce((acc, read) => {
        const date = read.datetime.getDay().toString();
        const salting = acc[date]?.salting ?? 1;
        const curd = acc[date]?.curd ?? 0;
        const maturation = acc[date]?.maturation ?? 0;
        acc[date] = { salting: salting + 1, curd, maturation };

        return acc;
      }, dailyCurdReads);

      const dailyReads = maturation.reduce((acc, read) => {
        const date = read.datetime.getDay().toString();
        const salting = acc[date]?.salting ?? 0;
        const curd = acc[date]?.curd ?? 0;
        const maturation = acc[date]?.maturation ?? 1;
        acc[date] = { salting, curd, maturation: maturation + 1 };
        return acc;
      }, dailySaltingReads);

      return dailyReads;
    };
}

export default SensorController;
