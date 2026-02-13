import type { RankingItemDTO } from "@/types/api.types";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://tesla-backend-ae28ecd7a6f3.herokuapp.com";

export const rankingService = {
  async obtenerRanking(userId: number): Promise<RankingItemDTO[]> {
    const response = await fetch(
      `${API_BASE}/api/ranking?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener ranking: ${response.status}`);
    }

    return response.json();
  },
};