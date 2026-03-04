import { useCallback, useEffect, useMemo, useState } from "react";

type PersistedLessonState = {
  indicePreguntaActual: number;
  respuestas: Record<string, number>;
  selectedAnswer: number | null;
  tiempoFin: number;
};

const buildDefaultState = (tiempoMinutos: number): PersistedLessonState => ({
  indicePreguntaActual: 0,
  respuestas: {},
  selectedAnswer: null,
  tiempoFin: Date.now() + tiempoMinutos * 60 * 1000,
});

export const usePersistenciaLeccion = (
  idLeccion: number | string | null | undefined,
  tiempoMinutos: number,
) => {
  // La llave solo existe cuando realmente tenemos id de lección; evita estados fantasma
  const storageKey = useMemo(
    () => (idLeccion ? `tesla_progreso_leccion_${idLeccion}` : null),
    [idLeccion]
  );

  const [estadoLeccion, setEstadoLeccion] = useState<PersistedLessonState | null>(() => {
    if (!storageKey) return null;

    try {
      const progresoGuardado = localStorage.getItem(storageKey);
      if (progresoGuardado) {
        return JSON.parse(progresoGuardado) as PersistedLessonState;
      }
    } catch (error) {
      console.warn("No se pudo leer el progreso guardado de la lección:", error);
    }

    return buildDefaultState(tiempoMinutos);
  });

  // Si el id llega tarde o cambia, sincronizamos desde el almacenamiento
  useEffect(() => {
    if (!storageKey) return;

    try {
      const progresoGuardado = localStorage.getItem(storageKey);
      if (progresoGuardado) {
        setEstadoLeccion(JSON.parse(progresoGuardado) as PersistedLessonState);
        return;
      }
    } catch (error) {
      console.warn("No se pudo leer el progreso guardado de la lección:", error);
    }

    setEstadoLeccion(buildDefaultState(tiempoMinutos));
  }, [storageKey, tiempoMinutos]);

  // Guardar automáticamente cada vez que cambia el estado válido
  useEffect(() => {
    if (storageKey && estadoLeccion) {
      localStorage.setItem(storageKey, JSON.stringify(estadoLeccion));
    }
  }, [estadoLeccion, storageKey]);

  const obtenerSegundosRestantes = useCallback(() => {
    if (!estadoLeccion) return tiempoMinutos * 60;
    const faltante = Math.floor((estadoLeccion.tiempoFin - Date.now()) / 1000);
    return faltante > 0 ? faltante : 0;
  }, [estadoLeccion, tiempoMinutos]);

  const limpiarProgreso = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    estadoLeccion,
    setEstadoLeccion,
    obtenerSegundosRestantes,
    limpiarProgreso,
  } as const;
};
