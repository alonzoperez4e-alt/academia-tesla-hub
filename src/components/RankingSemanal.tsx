import { useEffect, useState } from "react";
import { getTimeUntilNextMonday, type TimeUntil } from "@/utils/timeHelper";
import { rankingService, type RankingSemanalEntry } from "@/services/rankingService";

const RankingSemanal = () => {
  const [ranking, setRanking] = useState<RankingSemanalEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeUntil>(getTimeUntilNextMonday());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextMonday());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cargarRanking = async () => {
      try {
        const data = await rankingService.obtenerRankingSemanal();
        setRanking(data);
      } catch (err) {
        console.error("No se pudo cargar el ranking semanal", err);
        setError("No se pudo cargar el ranking semanal.");
      } finally {
        setLoading(false);
      }
    };

    cargarRanking();
  }, []);

  if (loading) {
    return <div className="text-center p-4 font-bold text-primary">Cargando Torneo Semanal...</div>;
  }

  if (error) {
    return <div className="text-center p-4 font-semibold text-destructive">{error}</div>;
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-8 border border-border">
      <h2 className="text-2xl font-extrabold text-foreground mb-4 text-center">🏆 Ranking Semanal - Academia Tesla</h2>

      <div className="bg-muted border-l-4 border-orange-500 text-foreground p-4 mb-6 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="font-bold">El torneo se reinicia en:</span>
        <span className="text-xl font-mono bg-background px-3 py-1 rounded shadow-sm">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-card border border-border rounded-lg">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="py-3 px-4 text-center">Pos</th>
              <th className="py-3 px-4 text-left">Futuro Cachimbo</th>
              <th className="py-3 px-4 text-right">EXP Semanal</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            {ranking.map((alumno) => (
              <tr
                key={alumno.idUsuario}
                className={`border-b border-border hover:bg-muted transition-colors ${alumno.esUsuarioActual ? "bg-primary/5 font-bold" : ""}`}
              >
                <td className="py-3 px-4 text-center text-lg">#{alumno.posicion}</td>
                <td className="py-3 px-4 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {alumno.inicial}
                    </div>
                    <span>{alumno.nombreCompleto}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-green-600">+{alumno.expSemanal} XP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingSemanal;
