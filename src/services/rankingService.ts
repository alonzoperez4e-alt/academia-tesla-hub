import type { RankingItemDTO } from "@/types/api.types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

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