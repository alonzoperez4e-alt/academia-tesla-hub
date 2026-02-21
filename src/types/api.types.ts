export interface RespuestaAlumnoDTO {
  idPregunta: number;
  idAlternativaSeleccionada: number;
}

export interface SolicitudCalificacionDTO {
  idUsuario: number;
  respuestas: RespuestaAlumnoDTO[];
}

export interface FeedbackPreguntaDTO {
  idPregunta: number;
  correcta: boolean;
  idAlternativaCorrecta: number;
  solucionTexto: string;
  solucionImagenUrl: string;
}

export interface ResultadoEvaluacionDTO {
  puntajeObtenido: number;
  expGanada: number;
  leccionAprobada: boolean;
  feedback: FeedbackPreguntaDTO[];
}

export interface CuestionarioDTO {
  idLeccion: number;
  nombreLeccion: string;
  preguntas: PreguntaDTO[];
}

export interface PreguntaDTO {
  idPregunta: number;
  textoPregunta: string;
  alternativas: AlternativaDTO[];
}

export interface AlternativaDTO {
  idAlternativa: number;
  texto: string;
}

/** Camino del curso (endpoint /api/estudiantes/curso/{cursoId}/camino) */
export interface CaminoCursoDTO {
  idCurso: number;
  nombreCurso: string;
  semanas: SemanaDTO[];
}

export interface SemanaDTO {
  idSemana: number;
  nroSemana: number;
  isBloqueada: boolean;
  lecciones: LeccionDTO[];
}

export interface LeccionDTO {
  idLeccion: number;
  nombre: string;
  orden: number;
  completada: boolean;
  puntajeObtenido: number;
}

export type EstadoMascota =
  | 'Huevo'
  | 'Agrietándose'
  | 'Naciendo'
  | 'Completamente Crecido';

export interface EstadisticasAlumnoDTO {
  idUsuario: number;
  rachaActual: number;
  expTotal: number;
  estadoMascota: EstadoMascota;
}

/** ========== Admin (DTOs de creación) ========== */

export interface CrearCursoDTO {
  nombre: string;
  descripcion: string;
  isHabilitado: boolean;
}

export interface CrearSemanaDTO {
  idCurso: number;
  nroSemana: number;
  isBloqueada: boolean;
}

export interface CrearLeccionDTO {
  idSemana: number;
  nombre: string;
  descripcion: string;
  orden: number;
}

export interface CrearAlternativaDTO {
  texto: string;
  isCorrecta: boolean;
}

export interface CrearPreguntaDTO {
  idLeccion: number;
  textoPregunta: string;
  solucionTexto: string;
  solucionImagenUrl: string;
  alternativas: CrearAlternativaDTO[];
}

/** ========== Entidades (según respuestas de Admin) ========== */

export interface Curso {
  idCurso: number;
  nombre: string;
  descripcion: string;
  isHabilitado: boolean;
}

export interface Semana {
  idSemana: number;
  curso: Curso;
  nroSemana: number;
  isBloqueada: boolean;
  lecciones: Leccion[];
}

export interface Leccion {
  idLeccion: number;
  /** Swagger lo muestra como "string" (posible referencia/DTO simplificado). */
  semana: string;
  nombre: string;
  descripcion: string;
  orden: number;
  preguntas: Pregunta[];
}

export interface Pregunta {
  idPregunta: number;
  /** Swagger lo muestra como "string" (posible referencia/DTO simplificado). */
  leccion: string;
  textoPregunta: string;
  solucionTexto: string;
  solucionImagenUrl: string;
  alternativas: Alternativa[];
}

export interface Alternativa {
  idAlternativa: number;
  /** Swagger lo muestra como "string" (posible referencia/DTO simplificado). */
  pregunta: string;
  textoAlternativa: string;
  isCorrecta: boolean;
}

/** ========== Respuestas típicas de endpoints ========== */

/** GET /api/estudiantes/cursos */
export type CursosResponse = Curso[];

/** POST /api/admin/cursos */
export type CrearCursoResponse = Curso;

/** POST /api/admin/semanas */
export type CrearSemanaResponse = Semana;

/** POST /api/admin/lecciones */
export type CrearLeccionResponse = Leccion;

/** POST /api/admin/preguntas */
export type CrearPreguntaResponse = Pregunta;

/** GET /api/lecciones/{idLeccion}/contenido */
export type ContenidoLeccionResponse = CuestionarioDTO;

/** POST /api/lecciones/{idLeccion}/finalizar */
export type FinalizarLeccionResponse = ResultadoEvaluacionDTO;


/** ========== LOGEO ========== */
export interface AuthResponse {
  accessToken: string;
  role: string;
  refreshToken?: string | null; // backend ahora puede no enviarlo en body
  nombre?: string;
  codigo?: string;
  idUsuario?: number;
}

export interface LoginRequest{
  codigo: string;
  password: string;
}

export interface RegisterRequest{
  codigo: string;
  nombre: string;
  apellido: string;
  password: string;
  role: string;
  area: string;
  tipoAlumno: string;
}

/** ========== Ranking ========== */

export interface RankingItemDTO {
  idUsuario: number;
  nombreCompleto: string;   
  inicial: string;          
  expTotal: number;         
  posicionActual: number;   
  tendencia: number;        
  esUsuarioActual: boolean; 
}