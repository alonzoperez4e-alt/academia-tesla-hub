import { useEffect, useState } from "react";
import { rankingService, type RankingHistorialEntry } from "@/services/rankingService";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const RankingSemanal = () => {
  const [historial, setHistorial] = useState<RankingHistorialEntry[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  const [busquedaAlumno, setBusquedaAlumno] = useState("");

  // Esto hace que busque automáticamente al cambiar los selectores (dropdowns)
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const dataHistorial = await rankingService.obtenerHistorial(mesSeleccionado, anioSeleccionado);
        setHistorial(dataHistorial);
      } catch (error) {
        console.error("Error cargando historial", error);
        setHistorial([]);
      }
    };
    cargarHistorial();
  }, [mesSeleccionado, anioSeleccionado]);

  const historialFiltrado = historial.filter((item) =>
    item.nombreCompleto.toLowerCase().includes(busquedaAlumno.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-12 mb-12 px-3 sm:px-4">
      <div className="bg-gradient-to-b from-gray-50 to-white p-5 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 sm:mb-8 gap-5 sm:gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">⭐ Salón de la Fama</h2>
            <p className="text-gray-500 mt-2 font-medium">Top 3 histórico de semanas anteriores.</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={busquedaAlumno}
              onChange={(e) => setBusquedaAlumno(e.target.value)}
              className="px-3 py-2.5 sm:px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 flex-grow min-w-[180px] sm:min-w-[220px]"
            />
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(parseInt(e.target.value, 10))}
              className="px-3 py-2.5 sm:px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {meses.map((mes, index) => (
                <option key={mes} value={index + 1}>{mes}</option>
              ))}
            </select>
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value, 10))}
              className="px-3 py-2.5 sm:px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {[2024, 2025, 2026, 2027].map((anio) => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-[540px] sm:min-w-full bg-white text-sm sm:text-base">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 sm:py-4 sm:px-6 text-center">Semana (Domingo)</th>
                <th className="py-3 px-4 sm:py-4 sm:px-6 text-center">Puesto</th>
                <th className="py-3 px-4 sm:py-4 sm:px-6 text-left">Estudiante</th>
                <th className="py-3 px-4 sm:py-4 sm:px-6 text-right">EXP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historialFiltrado.length > 0 ? (
                historialFiltrado.map((item) => (
                  <tr key={item.idHistorial} className="hover:bg-yellow-50 transition-all">
                    <td className="py-3 px-4 sm:py-4 sm:px-6 text-center text-sm font-medium text-gray-500">{item.fechaFinSemana}</td>
                    <td className="py-3 px-4 sm:py-4 sm:px-6 text-center text-2xl sm:text-3xl">
                      {item.posicion === 1 ? "🥇" : item.posicion === 2 ? "🥈" : "🥉"}
                    </td>
                    <td className="py-3 px-4 sm:py-4 sm:px-6 text-left font-bold text-gray-800 text-base sm:text-lg">{item.nombreCompleto}</td>
                    <td className="py-3 px-4 sm:py-4 sm:px-6 text-right font-bold text-yellow-600 text-base sm:text-lg">+{item.expObtenida} XP</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 sm:py-20 text-center text-gray-500 text-sm sm:text-base">
                    No hay registros para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Hint de scroll en móvil */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 sm:hidden">
          <span className="text-gray-400">⬅️</span>
          <span>Desliza para ver completo</span>
          <span className="text-gray-400">➡️</span>
        </div>
      </div>
    </div>
  );
};

export default RankingSemanal;
