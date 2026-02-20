import { api } from './api';
import type { RankingItemDTO } from "@/types/api.types";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://tesla-backend-ae28ecd7a6f3.herokuapp.com";

export const rankingService = {
  async obtenerRanking(userId: number): Promise<RankingItemDTO[]> {
    const response = await api.get<RankingItemDTO[]>('/ranking', {
      params: { userId },
    });
    return response.data;
  },
};
