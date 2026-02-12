import { useEffect, useState } from 'react';
import { fetchDinoStats } from '@/services/statsService';
import type { EstadoMascota, EstadisticasAlumnoDTO } from '@/types/api.types';

interface DinoMascotaProps {
  idUsuario?: number;
}

const ICON_MAP: Record<EstadoMascota, string> = {
  Huevo: '🥚',
  'Agrietándose': '🐣',
  Naciendo: '🐤',
  'Completamente Crecido': '🦕',
};

const DinoMascota = ({ idUsuario }: DinoMascotaProps) => {
  const [stats, setStats] = useState<EstadisticasAlumnoDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rachaAnterior, setRachaAnterior] = useState<number | null>(null);

  useEffect(() => {
    if (!idUsuario) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDinoStats(idUsuario);
        if (isMounted) setStats(data);
      } catch (err) {
        console.error('Error al cargar estadísticas del dino:', err);
        if (isMounted) setError('No se pudo cargar la mascota');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [idUsuario]);

  useEffect(() => {
    if (!stats) return;
    if (rachaAnterior !== null && stats.rachaActual === 0 && rachaAnterior > 0) {
      alert('¡Oh no! Perdiste tu racha. ¡Vuelve a empezar con todo, Tesla!');
    }
    setRachaAnterior(stats.rachaActual);
  }, [stats, rachaAnterior]);

  if (isLoading) return <p>Cargando mascota...</p>;
  if (error) return <p>{error}</p>;
  if (!stats) return <p>Sin datos de mascota.</p>;

  const progreso = Math.min((stats.expTotal / 3750) * 100, 100);
  const icon = ICON_MAP[stats.estadoMascota] ?? ICON_MAP.Huevo;

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '15px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '4rem' }}>{icon}</div>
      <h2>{stats.estadoMascota}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '15px 0' }}>
        <div
          className={`p-4 rounded-xl ${
            stats.rachaActual > 0 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          <p className="text-xs font-bold uppercase">Racha de Días</p>
          <p className="text-3xl font-black">
            {stats.rachaActual > 0 ? `🔥 ${stats.rachaActual}` : '❄️ 0'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
          <p className="text-xs font-bold uppercase">Exp Total</p>
          <p className="text-2xl font-black">✨ {stats.expTotal}</p>
        </div>
      </div>
      <div style={{ background: '#eee', borderRadius: '10px', height: '10px', width: '100%' }}>
        <div
          style={{
            background: '#4CAF50',
            width: `${progreso}%`,
            height: '100%',
            borderRadius: '10px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <p style={{ fontSize: '0.8rem' }}>{Math.floor(progreso)}% para ser un Tesla-Saurio</p>
    </div>
  );
};

export default DinoMascota;
