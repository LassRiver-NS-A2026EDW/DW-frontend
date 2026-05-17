import { http, setAuthToken } from "./http";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "N_R";
export type Role = "USER" | "ADMIN";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  name: string;
  role: Role;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  birthDate: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  message: string;
  gender: Gender;
  birthDate: string;
}

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await http<LoginResponse>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    });
    setAuthToken(res.token);
    return res;
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return http<RegisterResponse>("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  async logout(): Promise<void> {
    try {
      await http<void>("/auth/logout", { method: "POST" });
    } finally {
      setAuthToken(null);
    }
  },
};
