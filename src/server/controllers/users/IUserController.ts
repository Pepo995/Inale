export interface IUserController {
  /**
   * @throws PreconditionError
   * @throws NotFoundError
   */
  isUserAdmin: (userEmail: string) => Promise<boolean>;

  /**
   * @throws PreconditionError
   * @throws AlreadyAdminError
   */
  addNewAdmin: (userEmail: string) => Promise<void>;
}
