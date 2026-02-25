import { api } from './api';
import type { SemanaDetalleDTO, LeccionDetalleDTO, Curso, CrearCursoDTO, CrearSemanaDTO, Semana, ViewSemanaDTO, ViewLeccionDTO, CrearLeccionDTO, Leccion, CrearPreguntaDTO, Pregunta } from '../types/api.types';

export const adminService = {
  /**
   * POST /api/admin/cursos
   */
  crearCurso: async (data: CrearCursoDTO): Promise<Curso> => {
    const response = await api.post<Curso>('/courses', data);
    return response.data;
  },

  crearSemana: async (cursoId: number, data: CrearSemanaDTO): Promise<Semana> => {
    const response = await api.post<Semana>(`/weeks/${cursoId}`, data);
    return response.data;
  },

  crearLeccion: async (data: CrearLeccionDTO): Promise<Leccion> => {
    const response = await api.post<Leccion>('/lessons', data);
    return response.data;
  },

  crearPregunta: async (data: CrearPreguntaDTO, imagenPregunta?: File, imagenSolucion?: File): Promise<Pregunta> => {
    const formData = new FormData();
    formData.append('pregunta', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    if (imagenPregunta) {
      formData.append('imagenPregunta', imagenPregunta);
    }
    
    if (imagenSolucion) {
      formData.append('imagenSolucion', imagenSolucion);
    }

    const response = await api.post<Pregunta>('/questions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * GET http://localhost:8080/api/v1/weeks/{cursoId}
   * @returns 
   */
  listarSemanas: async (cursoId: number): Promise<ViewSemanaDTO[]> => {
  const response = await api.get<ViewSemanaDTO[]>(
    `/weeks/${cursoId}`
  );
  return response.data;
},

verDetalleSemana: async (idSemana: number): Promise<SemanaDetalleDTO> => {
  const response = await api.get<SemanaDetalleDTO>(`/lessons/${idSemana}/detalle`);
  return response.data;
},

eliminarLeccion: async (idLeccion: number): Promise<void> => {
  await api.delete(`/lessons/${idLeccion}`);
},

eliminarSemana: async (semanaId: number): Promise<void> => {
  await api.delete(`/weeks/${semanaId}`);
},

};
