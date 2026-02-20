import { api } from './api';
import type { RankingItemDTO } from "@/types/api.types";

export const rankingService = {
  async obtenerRanking(userId: number): Promise<RankingItemDTO[]> {
    const response = await api.get<RankingItemDTO[]>('/ranking', {
      params: { userId },
    });
    return response.data;
  },
};
