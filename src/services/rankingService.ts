import { api } from './api';
import type { RankingItemDTO } from "@/types/api.types";

export interface RankingSemanalEntry {
  idUsuario: number;
  posicion: number;
  inicial: string;
  nombreCompleto: string;
  expSemanal: number;
  esUsuarioActual: boolean;
}

export const rankingService = {
  async obtenerRanking(userId: number): Promise<RankingItemDTO[]> {
    const response = await api.get<RankingItemDTO[]>('/ranking', {
      params: { userId },
    });
    return response.data;
  },

  async obtenerRankingSemanal(): Promise<RankingSemanalEntry[]> {
    const response = await api.get<RankingItemDTO[]>('/ranking');
    const data = response.data ?? [];

    return data.map((item, index) => ({
      idUsuario: item.idUsuario,
      posicion: item.posicionActual ?? index + 1,
      inicial: item.inicial || (item.nombreCompleto?.[0]?.toUpperCase() ?? "?"),
      nombreCompleto: item.nombreCompleto,
      expSemanal: item.expTotal,
      esUsuarioActual: item.esUsuarioActual ?? false,
    }));
  },
};
