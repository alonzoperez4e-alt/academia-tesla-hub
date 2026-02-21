import { api } from './api';
import type {
  CaminoCursoDTO,
  RespuestaAlumnoDTO,
  ResultadoEvaluacionDTO,
  CuestionarioDTO,
  CursosResponse,
} from '../types/api.types';

export const estudianteService = {
  /**
   * GET /api/estudiantes/cursos
   */
  obtenerCursos: async (): Promise<CursosResponse> => {
    const response = await api.get<CursosResponse>('/courses');
    return response.data;
  },

  /**
   * GET /api/estudiantes/curso/{cursoId}/camino?usuarioId={usuarioId}
   */
  obtenerCaminoCurso: async (cursoId: number, usuarioId: number): Promise<CaminoCursoDTO> => {
    const response = await api.get<CaminoCursoDTO>(
      `/courses/${cursoId}/path`,
      { params: { usuarioId } }
    );
    return response.data;
  },

  /**
   * GET /api/lecciones/{idLeccion}/contenido
   */
  obtenerContenidoLeccion: async (idLeccion: number): Promise<CuestionarioDTO> => {
    const response = await api.get<CuestionarioDTO>(`/lessons/${idLeccion}/quiz`);
    return response.data;
  },

  /**
   * POST /api/lecciones/{idLeccion}/finalizar
   * Body: { idUsuario, respuestas }
   * Returns: ResultadoEvaluacionDTO
   */
  finalizarLeccion: async (
    idLeccion: number,
    idUsuario: number,
    respuestas: RespuestaAlumnoDTO[]
  ): Promise<ResultadoEvaluacionDTO> => {
    const response = await api.post<ResultadoEvaluacionDTO>(
      `/lessons/${idLeccion}/submit`,
      { idUsuario, respuestas }
    );
    return response.data;
  },
};