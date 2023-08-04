import type { ICheeseTypeRepository } from "@infrastructure/cheeseTypes/ICheeseTypeRepository";
import { type ICheeseTypeController } from "./ICheeseTypeController";

class CheeseTypeController implements ICheeseTypeController {
  private cheeseTypeRepository;
  constructor(cheeseTypeRepository: ICheeseTypeRepository) {
    this.cheeseTypeRepository = cheeseTypeRepository;
  }

  getAllCheeseTypes: ICheeseTypeController["getAllCheeseTypes"] = async (
    includeDeleted
  ) => await this.cheeseTypeRepository.getAllCheeseTypes(includeDeleted);

  /**
   * @throws NotFoundError
   */
  getCheeseType: ICheeseTypeController["getCheeseType"] = async (name) =>
    await this.cheeseTypeRepository.getCheeseType(name);

  /**
   * @throws UniqueConstraintFailedError
   * @throws DatabaseError
   */
  createCheeseType: ICheeseTypeController["createCheeseType"] = async (
    cheeseType
  ) => await this.cheeseTypeRepository.createCheeseType(cheeseType);

  updateCheeseType: ICheeseTypeController["updateCheeseType"] = async (
    cheeseType
  ) => await this.cheeseTypeRepository.updateCheeseType(cheeseType);

  /**
   * @throws NotFoundError
   */
  deleteCheeseType: ICheeseTypeController["deleteCheeseType"] = async (name) =>
    await this.cheeseTypeRepository.deleteCheeseType(name);

  /**
   * @throws NotFoundError
   */
  restoreCheeseType: ICheeseTypeController["restoreCheeseType"] = async (rut) =>
    await this.cheeseTypeRepository.restoreCheeseType(rut);
}

export default CheeseTypeController;
