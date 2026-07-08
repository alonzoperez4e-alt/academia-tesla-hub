import { api } from './api';
import type { UsuarioDTO } from '@/types/api.types';

export const userService = {
  async getMe(): Promise<UsuarioDTO> {
    const response = await api.get<UsuarioDTO>('/users/me');
    return response.data;
  },
};
