import { api } from './api';
import type { EstadisticasAlumnoDTO } from '@/types/api.types';

const STATS_BASE_PATH = '/stats';

export const statsService = {
  getStudentStats: async (): Promise<EstadisticasAlumnoDTO> => {
    const response = await api.get<EstadisticasAlumnoDTO>(`${STATS_BASE_PATH}/me`);
    return response.data;
  },
  completarMision: async (expGanada: number): Promise<EstadisticasAlumnoDTO> => {
    const response = await api.post<EstadisticasAlumnoDTO>(
      `${STATS_BASE_PATH}/mision-completa`,
      { exp: expGanada }
    );
    return response.data;
  },
};

// Alias solicitado: mantiene compatibilidad con la firma propuesta en la guía
export const fetchDinoStats = async (idUsuario: number): Promise<EstadisticasAlumnoDTO> => {
  return statsService.getStudentStats();
};

export const completarMision = async (idUsuario: number, expGanada: number): Promise<EstadisticasAlumnoDTO> => {
  return statsService.completarMision(expGanada);
};
