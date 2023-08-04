import type { CheeseType } from "@types";

export interface ICheeseTypeController {
  getAllCheeseTypes(includeDeleted?: boolean): Promise<CheeseType[]>;

  /**
   * @throws NotFoundError
   */
  getCheeseType(name: string): Promise<CheeseType>;

  /**
   * @throws UniqueConstraintFailedError
   */
  createCheeseType(cheeseType: CheeseType): Promise<CheeseType>;

  updateCheeseType(cheeseType: CheeseType): Promise<CheeseType>;

  /**
   * @throws NotFoundError
   */
  deleteCheeseType: (name: string) => Promise<CheeseType>;

  /**
   * @throws NotFoundError
   */
  restoreCheeseType: (name: string) => Promise<CheeseType>;
}
