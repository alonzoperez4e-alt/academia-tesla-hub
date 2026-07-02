import { api } from './api';
import type { SemanaDetalleDTO, LeccionDetalleDTO, Curso, CrearCursoDTO, CrearSemanaDTO, Semana, ViewSemanaDTO, ViewLeccionDTO, CrearLeccionDTO, Leccion, CrearPreguntaDTO, Pregunta } from '../types/api.types';

type UploadFileResponse = {
  url: string;
};

const uploadFileViaBackend = async (file: File): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadFileResponse>('/admin/upload', formData);
  return response.data;
};

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

  // Las imágenes ya se suben a S3 vía presigned URL antes de esta llamada
  // (ver LessonFormModal.handleSaveLesson); aquí solo se envían sus publicUrl.
  crearPregunta: async (data: CrearPreguntaDTO): Promise<Pregunta> => {
    const response = await api.post<Pregunta>('/questions', data);
    return response.data;
  },

  uploadQuestionImage: async (file: File): Promise<UploadFileResponse> => {
    return uploadFileViaBackend(file);
  },

  uploadFile: async (file: File): Promise<UploadFileResponse> => {
    return uploadFileViaBackend(file);
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
