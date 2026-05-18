import { http } from "./http";
import { Gender, Role } from "./auth";

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  gender: Gender | null;
  birthDate: string | null;
}

export interface UserProfileUpdateRequest {
  name: string;
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = {
  me(): Promise<UserProfileResponse> {
    return http<UserProfileResponse>("/users/me");
  },

  updateMe(payload: UserProfileUpdateRequest): Promise<UserProfileResponse> {
    return http<UserProfileResponse>("/users/me", { method: "PUT", body: payload });
  },

  changePassword(payload: PasswordChangeRequest): Promise<void> {
    return http<void>("/users/me/password", { method: "PATCH", body: payload });
  },
};
