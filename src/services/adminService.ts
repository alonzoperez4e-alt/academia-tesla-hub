import { api } from './api';
import type { Curso, CrearCursoDTO } from '../types/api.types';

export const adminService = {
  /**
   * POST /api/admin/cursos
   */
  crearCurso: async (data: CrearCursoDTO): Promise<Curso> => {
    // Si la API es diferente, ajustar la ruta según corresponda.
    // basado en api.types.ts "/** POST /api/admin/cursos */"
    const response = await api.post<Curso>('/courses', data);
    return response.data;
  },
};
