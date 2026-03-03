import { useEffect, useMemo, useState } from "react";
import { Download, Calendar, Trophy } from "lucide-react";
import * as XLSX from "xlsx";
import { api } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface RankingRow {
  posicion: number;
  nombreCompleto: string;
  expObtenida?: number;
  expParaRanking?: number;
  expTotal?: number;
  exp?: number;
}

export const GestionarRanking = () => {
  const [fechas, setFechas] = useState<string[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");
  const [rankingData, setRankingData] = useState<RankingRow[]>([]);
  const [cargando, setCargando] = useState(false);

  const opcionesFechas = useMemo(() => fechas.map((f) => ({ label: `Semana: ${f}`, value: f })), [fechas]);
  const mesActual = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const semanasFiltradas = useMemo(() => {
    if (!mesSeleccionado) return opcionesFechas;
    return opcionesFechas.filter(({ value }) => {
      const d = new Date(value);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return ym === mesSeleccionado;
    });
  }, [mesSeleccionado, opcionesFechas]);


  useEffect(() => {
    const cargarFechas = async () => {
      try {
        const res = await api.get<string[]>("/ranking/historial/fechas");
        setFechas(res.data || []);
        if (res.data?.length) {
          setFechaSeleccionada(res.data[0]);
          const primeraFecha = new Date(res.data[0]);
          const ym = `${primeraFecha.getFullYear()}-${String(primeraFecha.getMonth() + 1).padStart(2, "0")}`;
          setMesSeleccionado(ym);
        } else {
          setMesSeleccionado(mesActual);
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar las fechas de ranking.", variant: "destructive" });
      }
    };
    cargarFechas();
  }, []);

  useEffect(() => {
    const cargarRankingPorFecha = async () => {
      if (!fechaSeleccionada) return;
      setCargando(true);
      try {
        const res = await api.get<RankingRow[]>(`/ranking/historial/admin?fecha=${fechaSeleccionada}`);
        const normalizado = (res.data || []).map((fila) => ({
          ...fila,
          expObtenida: fila.expObtenida ?? fila.expParaRanking ?? fila.expTotal ?? fila.exp ?? 0,
        }));
        setRankingData(normalizado);
      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar el ranking de la semana seleccionada.", variant: "destructive" });
      } finally {
        setCargando(false);
      }
    };
    cargarRankingPorFecha();
  }, [fechaSeleccionada]);

  const exportarAExcel = () => {
    if (!rankingData.length || !fechaSeleccionada) {
      toast({ title: "Sin datos", description: "No hay ranking disponible para exportar." });
      return;
    }

    const wsData: (string | number)[][] = [];

    // Encabezados
    wsData.push(["Puesto", "Estudiante", "Experiencia"]);

    // Datos
    rankingData.forEach((fila) => {
      wsData.push([
        fila.posicion,
        fila.nombreCompleto,
        fila.expObtenida ?? 0,
      ]);
    });

    const hoja = XLSX.utils.aoa_to_sheet(wsData);

    // Anchos de columna
    hoja["!cols"] = [{ wch: 10 }, { wch: 36 }, { wch: 16 }];

    const applyStyle = (cellRef: string, style: Partial<XLSX.CellObject["s"]>) => {
      const cell = hoja[cellRef];
      if (cell) {
        cell.s = { ...(cell.s || {}), ...style };
      }
    };

    // Estilos encabezados
    const headerRow = 1; // 1-based for AOA (first row)
    const headers = ["A", "B", "C"];
    headers.forEach((col) => {
      applyStyle(`${col}${headerRow}`, {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { patternType: "solid", fgColor: { rgb: "2563EB" } },
        border: {
          top: { style: "thin", color: { rgb: "E5E7EB" } },
          bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        },
      });
    });

    // Estilos filas de datos
    const startDataRow = headerRow + 1;
    const endDataRow = startDataRow + rankingData.length - 1;
    for (let r = startDataRow; r <= endDataRow; r++) {
      const isStriped = (r - startDataRow) % 2 === 1;
      const fillColor = isStriped ? "F8FAFC" : undefined;
      // Puesto (col A)
      applyStyle(`A${r}`, {
        font: { bold: true, color: { rgb: "0F172A" } },
        alignment: { horizontal: "center" },
        fill: fillColor ? { patternType: "solid", fgColor: { rgb: fillColor } } : undefined,
        border: {
          bottom: { style: "hair", color: { rgb: "E2E8F0" } },
        },
      });
      // Estudiante (col B)
      applyStyle(`B${r}`, {
        font: { color: { rgb: "0F172A" } },
        alignment: { horizontal: "left" },
        fill: fillColor ? { patternType: "solid", fgColor: { rgb: fillColor } } : undefined,
        border: {
          bottom: { style: "hair", color: { rgb: "E2E8F0" } },
        },
      });
      // EXP (col C)
      applyStyle(`C${r}`, {
        font: { bold: true, color: { rgb: "1D4ED8" } },
        alignment: { horizontal: "right" },
        numFmt: "#,##0",
        fill: fillColor ? { patternType: "solid", fgColor: { rgb: fillColor } } : undefined,
        border: {
          bottom: { style: "hair", color: { rgb: "E2E8F0" } },
        },
      });
    }

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Ranking Semanal");
    XLSX.writeFile(libro, `Ranking_Semana_${fechaSeleccionada}.xlsx`);
  };

  return (
    <>
      <style>{`
        input.no-clear-month::-webkit-clear-button { display: none; }
        input.no-clear-month::-webkit-inner-spin-button { display: none; }
        input.no-clear-month::-ms-clear { display: none; }
      `}</style>
      <div className="p-4 lg:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Trophy className="text-yellow-500" />
            Historial de Ranking
          </h1>
          <p className="text-slate-500 mt-1">Supervisa y exporta el progreso semanal de los estudiantes.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="month"
              value={mesSeleccionado}
              onChange={(e) => {
                const val = e.target.value || mesActual;
                setMesSeleccionado(val);
                setFechaSeleccionada("");
              }}
              min="2026-01"
              max="2036-12"
              className="bg-transparent text-slate-700 font-medium border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 no-clear-month"
            />
          </div>

          <button
            onClick={exportarAExcel}
            disabled={!rankingData.length}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tarjetas de semanas filtradas por mes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {semanasFiltradas.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-lg p-4 text-slate-500 text-center">
            No hay semanas para este mes.
          </div>
        )}
        {semanasFiltradas.map((semana) => {
          const isActive = semana.value === fechaSeleccionada;
          return (
            <button
              key={semana.value}
              onClick={() => setFechaSeleccionada(semana.value)}
              className={`text-left rounded-xl border px-3 py-3 shadow-sm transition text-sm ${
                isActive
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <div className="text-[11px] text-slate-500">Semana</div>
              <div className="text-sm font-semibold leading-tight">{semana.label}</div>
            </button>
          );
        })}
      </div>

      {fechaSeleccionada && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {cargando ? (
            <div className="p-10 text-center text-slate-500">Cargando datos...</div>
          ) : !rankingData.length ? (
            <div className="p-10 text-center text-slate-500">No hay datos para la fecha seleccionada.</div>
          ) : (
            <div className="overflow-x-auto sm:overflow-visible">
              <table className="w-full text-left border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="p-3 sm:p-4 font-semibold text-center w-20 sm:w-24">Puesto</th>
                    <th className="p-3 sm:p-4 font-semibold">Estudiante</th>
                    <th className="p-3 sm:p-4 font-semibold text-right">Experiencia</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((row) => (
                    <tr key={`${row.posicion}-${row.nombreCompleto}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 sm:p-4 text-center font-bold text-slate-700 text-sm sm:text-base">#{row.posicion}</td>
                      <td className="p-3 sm:p-4 font-medium text-slate-800 text-sm sm:text-base">{row.nombreCompleto}</td>
                      <td className="p-3 sm:p-4 text-right text-blue-600 font-bold text-sm sm:text-base">{(row.expObtenida ?? 0).toLocaleString()} EXP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};
