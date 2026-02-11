import { api } from './api';
import type { LoginRequest, AuthResponse, RegisterRequest } from '../types/api.types';

export const loginService = {
  /**
   * POST /api/auth/login
   */
  LogearUsuario: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * POST /api/auth/register
   */
  RegistrarUsuario: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};