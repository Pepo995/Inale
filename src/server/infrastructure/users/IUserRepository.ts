import type { User } from "@types";

export interface IUserRepository {
  getUserByMail: (userEmail: string) => Promise<User>;
  upsertUserByMail: (
    user: Omit<User, "email" | "id" | "name"> & { email: string; name?: string }
  ) => Promise<User>;
}
