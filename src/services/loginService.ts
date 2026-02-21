import { api } from './api';
import { authSession } from './authSession';
import { decodeJwtClaims } from "./jwt";
import type { LoginRequest, AuthResponse, RegisterRequest } from '../types/api.types';

const normalizeRole = (role?: string | null) => (role ?? "").trim().toLowerCase() || null;

export const loginService = {
  LogearUsuario: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    const data = response.data;

    const claims = decodeJwtClaims(data.accessToken);
    const normalizedRole = normalizeRole(data.role ?? claims?.role ?? null);

    authSession.set(data.accessToken, normalizedRole, {
      idUsuario: claims?.idUsuario ?? null,
      nombre: claims?.nombre ?? null,
      apellido: claims?.apellido ?? null,
      codigo: claims?.sub ?? credentials.codigo ?? null,
    });

    return data;
  },

  RegistrarUsuario: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
  },
};