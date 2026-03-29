import type { AxiosError } from 'axios';
import { api } from './api';
import type { GroupInfo, GroupRankingEntry } from '@/types/api.types';

// api baseURL ya incluye /api/v1; mantener solo el segmento de recurso para evitar duplicar la ruta
const GROUPS_BASE = '/groups';

const extractErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError;
  const data = axiosError?.response?.data as any;
  if (typeof data === 'string') return data;
  if (data?.message) return String(data.message);
  return 'Ocurrió un error. Inténtalo de nuevo.';
};

export const groupService = {
  async getStudentGroup(studentId: number): Promise<GroupInfo | null> {
    const response = await api.get<GroupInfo>(`${GROUPS_BASE}/student/${studentId}`);
    if (response.status === 204) return null;
    return response.data ?? null;
  },

  async createGroup(name: string, creatorId: number): Promise<GroupInfo> {
    try {
      const response = await api.post<GroupInfo>(`${GROUPS_BASE}/create`, undefined, {
        params: { name, creatorId },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async joinGroup(code: string, studentId: number): Promise<string> {
    try {
      const response = await api.post<string>(`${GROUPS_BASE}/join`, { code, studentId });
      if (typeof response.data === 'string') return response.data;
      return 'Te has unido al grupo.';
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async leaveGroup(groupId: number, studentId: number): Promise<string> {
    try {
      const response = await api.post<string>(`${GROUPS_BASE}/${groupId}/leave`, { studentId });
      if (typeof response.data === 'string') return response.data;
      return 'Has salido del grupo.';
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async getRanking(groupId: number): Promise<GroupRankingEntry[]> {
    const response = await api.get<GroupRankingEntry[]>(`${GROUPS_BASE}/${groupId}/ranking`);
    return response.data ?? [];
  },
};
