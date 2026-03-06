import { useCallback, useEffect, useMemo, useState } from "react";

type PersistedLessonState = {
  indicePreguntaActual: number;
  respuestas: Record<string, number>;
  selectedAnswer: number | null;
  tiempoFin: number;
  attemptId: string;
  enCurso: boolean;
};

const buildDefaultState = (tiempoMinutos: number): PersistedLessonState => ({
  indicePreguntaActual: 0,
  respuestas: {},
  selectedAnswer: null,
  tiempoFin: Date.now() + tiempoMinutos * 60 * 1000,
  attemptId: `attempt-${Date.now()}`,
  enCurso: true,
});

export const usePersistenciaLeccion = (
  idLeccion: number | string | null | undefined,
  tiempoMinutos: number,
) => {
  const storageKey = useMemo(
    () => (idLeccion ? `tesla_progreso_leccion_${idLeccion}` : null),
    [idLeccion]
  );
  const reloadFlagKey = useMemo(
    () => (idLeccion ? `tesla_reloading_lesson_${idLeccion}` : null),
    [idLeccion]
  );

  const [estadoLeccion, setEstadoLeccion] = useState<PersistedLessonState | null>(null);
  const [esReanudacion, setEsReanudacion] = useState(false);

  useEffect(() => {
    if (!storageKey || !reloadFlagKey) return;

    const progresoGuardado = localStorage.getItem(storageKey);
    // Bandera rápida de recarga: timestamp reciente guardado en session/local storage
    const rawFlag = reloadFlagKey
      ? sessionStorage.getItem(reloadFlagKey) ?? localStorage.getItem(reloadFlagKey)
      : null;
    const flagTimestamp = rawFlag ? Number(rawFlag) : NaN;
    const ahora = Date.now();
    const recargaReciente = Number.isFinite(flagTimestamp) && ahora - flagTimestamp < 8000;

    const navigation = window.performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navType = navigation[0]?.type;
    // Reload real o restauración de pestaña (bfcache)
    const esTipoRecarga = navType === "reload" || navType === "back_forward";
    const debeMostrarModal = recargaReciente && esTipoRecarga;

    // limpiar banderas inmediatamente para evitar falsos positivos posteriores
    if (reloadFlagKey) {
      sessionStorage.removeItem(reloadFlagKey);
      localStorage.removeItem(reloadFlagKey);
    }

    if (progresoGuardado) {
      const parsed = JSON.parse(progresoGuardado) as PersistedLessonState;

      if (Date.now() > parsed.tiempoFin) {
        localStorage.removeItem(storageKey);
        setEstadoLeccion(buildDefaultState(tiempoMinutos));
        setEsReanudacion(false);
      } else {
        setEstadoLeccion({
          ...parsed,
          attemptId: parsed.attemptId ?? `attempt-${Date.now()}`,
          enCurso: parsed.enCurso ?? true,
        });
        // Solo mostramos modal si hay progreso y la sesión sigue en curso
        setEsReanudacion(debeMostrarModal && (parsed.enCurso ?? true));
      }
    } else {
      setEstadoLeccion(buildDefaultState(tiempoMinutos));
      setEsReanudacion(false);
    }
  }, [storageKey, reloadFlagKey, tiempoMinutos]);

  useEffect(() => {
    if (storageKey && estadoLeccion) {
      localStorage.setItem(storageKey, JSON.stringify(estadoLeccion));
    }
  }, [estadoLeccion, storageKey]);

  useEffect(() => {
    if (!reloadFlagKey) return;

    const stampReload = () => {
      sessionStorage.setItem(reloadFlagKey, String(Date.now()));
    };

    window.addEventListener("beforeunload", stampReload);
    window.addEventListener("pagehide", stampReload);

    return () => {
      window.removeEventListener("beforeunload", stampReload);
      window.removeEventListener("pagehide", stampReload);
    };
  }, [reloadFlagKey]);

  const obtenerSegundosRestantes = useCallback(() => {
    if (!estadoLeccion) return tiempoMinutos * 60;
    const faltante = Math.floor((estadoLeccion.tiempoFin - Date.now()) / 1000);
    return faltante > 0 ? faltante : 0;
  }, [estadoLeccion, tiempoMinutos]);

  const limpiarProgreso = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    if (reloadFlagKey) {
      sessionStorage.removeItem(reloadFlagKey);
    }
  }, [storageKey, reloadFlagKey]);

  return {
    estadoLeccion,
    setEstadoLeccion,
    obtenerSegundosRestantes,
    limpiarProgreso,
    esReanudacion,
    setEsReanudacion,
  } as const;
};
