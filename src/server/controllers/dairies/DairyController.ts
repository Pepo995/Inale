import { NotFoundError } from "@errors";
import { type IDairyController } from "./IDairyController";
import { type IDairyRepository } from "@infrastructure/dairies/IDairyRepository";

class DairyController implements IDairyController {
  private dairyRepository;
  constructor(dairyRepository: IDairyRepository) {
    this.dairyRepository = dairyRepository;
  }
  getAllDairiesWithProducerAndEmployees: IDairyController["getAllDairiesWithProducerAndEmployees"] =
    async (includeDeleted) =>
      await this.dairyRepository.getAllDairiesWithProducerAndEmployees(
        includeDeleted
      );

  getAllDairies: IDairyController["getAllDairies"] = async (includeDeleted) =>
    await this.dairyRepository.getAllDairies(includeDeleted);

  /**
   * @throws NotFoundError
   */
  getDairyByRut: IDairyController["getDairyByRut"] = async (rut) =>
    await this.dairyRepository.getDairyByRut(rut);

  getDairyCheeseTypesByRut: IDairyController["getDairyCheeseTypesByRut"] =
    async (dairyRut: number) =>
      await this.dairyRepository.getDairyCheeseTypesByRut(dairyRut);

  /**
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createDairy: IDairyController["createDairy"] = async (input) => {
    const createdDairy = await this.dairyRepository.createDairy(input);
    return createdDairy;
  };

  /**
   * @throws NotFoundError
   */
  updateDairyInfo: IDairyController["updateDairyInfo"] = async (input) => {
    const dairy = await this.dairyRepository.getDairyByRut(input.rut);

    if (!dairy) {
      throw new NotFoundError(
        `Dairy with rut "${input.rut}" not found`,
        "DAIRY"
      );
    }

    const updatedDairy = await this.dairyRepository.updateDairyInfo(input);

    // Converting obtained dairy to be comparable with the updated one.
    const convertedDairy = {
      ...dairy,
      producer: undefined,
      cheeseTypes: dairy.cheeseTypes.filter(
        (cheeseType) => cheeseType.deleted === undefined
      ),
    };

    return JSON.stringify(updatedDairy) === JSON.stringify(convertedDairy)
      ? false
      : updatedDairy;
  };

  /**
   * @throws NotFoundError
   */
  deleteDairy: IDairyController["deleteDairy"] = async (rut) =>
    await this.dairyRepository.deleteDairy(rut);

  /**
   * @throws NotFoundError
   */
  restoreDairy: IDairyController["restoreDairy"] = async (rut) =>
    await this.dairyRepository.restoreDairy(rut);

  /**
   * @throws DatabaseError
   */
  getDairyLocationStats: IDairyController["getDairyLocationStats"] = async () =>
    await this.dairyRepository.getDairyLocationStats();

  /**
   * @throws DatabaseError
   */
  getDairyFailedCertifications: IDairyController["getDairyFailedCertifications"] =
    async (rut: number, minDate: Date, maxDate: Date) =>
      await this.dairyRepository.getDairyFailedCertifications(
        rut,
        minDate,
        maxDate
      );
}

export default DairyController;
