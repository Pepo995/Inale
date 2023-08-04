import { type IUserController } from "./IUserController";
import { type IUserRepository } from "@infrastructure/users/IUserRepository";
import { AlreadyAdminError, NotFoundError, PreconditionError } from "@errors";

export default class UserController implements IUserController {
  private userRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * @throws PreconditionError
   * @throws NotFoundError
   */
  isUserAdmin: IUserController["isUserAdmin"] = async (userEmail: string) => {
    if (!this.userRepository)
      throw new PreconditionError("UserRepository is not defined");

    const user = await this.userRepository.getUserByMail(userEmail);

    return user.isAdmin;
  };

  /**
   * @throws PreconditionError
   * @throws AlreadyAdminError
   */
  addNewAdmin: IUserController["addNewAdmin"] = async (userEmail: string) => {
    if (!this.userRepository)
      throw new PreconditionError("UserRepository is not defined");

    let currentUser;
    try {
      currentUser = await this.userRepository.getUserByMail(userEmail);

      if (currentUser.isAdmin)
        throw new AlreadyAdminError("User is already an admin");
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }

    await this.userRepository.upsertUserByMail({
      email: userEmail,
      isAdmin: true,
    });
  };
}
