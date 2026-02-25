import { api } from './api';
import type { RankingItemDTO } from "@/types/api.types";

export interface RankingSemanalEntry {
  idUsuario: number;
  posicion: number;
  inicial: string;
  nombreCompleto: string;
  expParaRanking: number;
  expSemanal?: number;
  esUsuarioActual?: boolean;
}

export interface RankingHistorialEntry {
  idHistorial: number;
  fechaFinSemana: string;
  posicion: number;
  nombreCompleto: string;
  expObtenida: number;
}

export const rankingService = {
  async obtenerRanking(userId: number): Promise<RankingItemDTO[]> {
    const response = await api.get<RankingItemDTO[]>('/ranking', {
      params: { userId },
    });
    return response.data;
  },

  async obtenerRankingSemanal(): Promise<RankingSemanalEntry[]> {
    const response = await api.get<any[]>('/ranking/semanal');
    const data = response.data ?? [];

    return data.map((item, index) => ({
      idUsuario: item.idUsuario,
      posicion: item.posicionActual ?? item.posicion ?? index + 1,
      inicial: item.inicial || (item.nombreCompleto?.[0]?.toUpperCase() ?? "?"),
      nombreCompleto: item.nombreCompleto,
      expParaRanking: item.expParaRanking ?? item.expTotal ?? 0,
      expSemanal: item.expTotal,
      esUsuarioActual: item.esUsuarioActual ?? false,
    }));
  },

  async obtenerHistorial(mes: number, anio: number): Promise<RankingHistorialEntry[]> {
    const response = await api.get<RankingHistorialEntry[]>(`/ranking/historial`, {
      params: { mes, anio },
    });
    return response.data ?? [];
  },
};
