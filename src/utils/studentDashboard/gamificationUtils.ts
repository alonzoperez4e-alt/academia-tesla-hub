import type { SemanaDTO, CuestionarioDTO } from "@/types/api.types";
import type { QuizQuestion } from "@/components/student/QuizModal";

export function mapSemanasToWeeks(semanas: SemanaDTO[]) {
  const sortedWeeks = [...semanas].sort((a, b) => a.nroSemana - b.nroSemana);

  return sortedWeeks.map((semana) => {
    const sortedLessons = [...semana.lecciones].sort((a, b) => a.orden - b.orden);

    return {
      week: semana.nroSemana,
      title: `Semana ${semana.nroSemana}`,
      isUnlocked: !semana.isBloqueada,
      lessons: sortedLessons.map((leccion, index) => {
        const allPreviousCompleted = sortedLessons
          .slice(0, index)
          .every((l) => l.completada);

        const isCurrent = !semana.isBloqueada && !leccion.completada && allPreviousCompleted;
        const isLocked = semana.isBloqueada || (index > 0 && !sortedLessons[index - 1]?.completada && !leccion.completada);

        return {
          id: String(leccion.idLeccion),
          type: "leccion" as const,
          title: leccion.nombre,
          description: "",
          isCompleted: leccion.completada,
          isLocked,
          isCurrent,
          exp: leccion.puntajeObtenido,
          completionRate: leccion.completada ? 100 : 0,
        };
      }),
    };
  });
}

export function mapCuestionarioToQuizQuestions(cuestionario: CuestionarioDTO): QuizQuestion[] {
  return cuestionario.preguntas.map((pregunta) => ({
    id: String(pregunta.idPregunta),
    text: pregunta.textoPregunta,
    options: pregunta.alternativas.map((alt) => alt.texto),
    alternativaIds: pregunta.alternativas.map((alt) => alt.idAlternativa),
  }));
}

export function mapTrend(tendencia: number): "up" | "down" | "same" {
  if (tendencia > 0) return "up";
  if (tendencia < 0) return "down";
  return "same";
}