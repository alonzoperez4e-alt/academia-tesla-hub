import { Crown, Medal, Trophy, TrendingUp, TrendingDown, Minus, Gem, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import RankingSemanal from "@/components/RankingSemanal";
import Temporizador from "@/components/Temporizador";
import type { RankingItemDTO } from "@/types/api.types";

interface RankingEntry {
  position: number;
  name: string;
  avatar?: string;
  exp: number;
  expForRanking?: number;
  isCurrentUser?: boolean;
  trend: "up" | "down" | "same";
  previousPosition?: number;
}

interface RankingTabProps {
  rankings: RankingEntry[];
  userPosition: number;
  userPreviousPosition: number;
  totalStudents: number;
  rawRankingData: RankingItemDTO[];
  currentUser?: RankingItemDTO | null;
  userId?: number | null;
}

export const RankingTab = ({ 
  rankings, 
  userPosition, 
  userPreviousPosition,
  totalStudents,
  rawRankingData,
  currentUser,
  userId
}: RankingTabProps) => {
  const usuarioActual = (rawRankingData ?? []).find((alumno) => alumno.esUsuarioActual)
    ?? (rawRankingData ?? []).find((alumno) => userId && alumno.idUsuario === userId)
    ?? currentUser
    ?? null;

  const fallbackRanking = rankings.find((r) => r.isCurrentUser || (userId && rawRankingData?.find(a => a.idUsuario === userId && a.posicionActual === r.position)));

  const derivePositionFromExp = () => {
    if (!userId || !(rawRankingData?.length)) return 0;
    const ordered = [...rawRankingData]
      .map(item => ({ id: item.idUsuario, exp: item.expParaRanking ?? item.expTotal ?? 0 }))
      .sort((a, b) => b.exp - a.exp);
    const idx = ordered.findIndex((item) => item.id === userId);
    return idx >= 0 ? idx + 1 : 0;
  };

  let currentPos = usuarioActual?.posicionActual
    ?? fallbackRanking?.position
    ?? userPosition
    ?? 0;

  if (!(Number.isFinite(currentPos) && currentPos > 0)) {
    const derived = derivePositionFromExp();
    if (derived > 0) currentPos = derived;
  }

  const previousPos = usuarioActual?.rankingAnterior
    ?? fallbackRanking?.previousPosition
    ?? userPreviousPosition
    ?? 0;

  const currentDisplay = Number.isFinite(currentPos) && currentPos > 0 ? currentPos : "-";
  const previousDisplay = Number.isFinite(previousPos) && previousPos > 0 ? previousPos : "-";
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  const getTrophyColor = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-400 to-amber-500";
      case 2: return "from-gray-300 to-gray-400";
      case 3: return "from-amber-600 to-orange-700";
      default: return "from-muted to-muted";
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-success" />;
      case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <Temporizador />
      </div>

      {/* Header mejorado y compacto */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        {/* WIDGET: TU LUGAR EN EL RANKING */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          {/* Título Superior */}
          <div className="flex items-center gap-2 text-slate-500 font-medium mb-4">
            <span>🎯</span>
            <span>Tu lugar en el ranking</span>
          </div>

          <div className="flex items-center gap-6">
            {/* 1. TOP ACTUAL (EL NÚMERO GIGANTE basado en exp_semanal) */}
            <div className="flex flex-col items-center">
              <h2 className="text-6xl font-black text-blue-950 drop-shadow-sm">
                #{currentDisplay}
              </h2>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex flex-col">
                <span className="font-bold text-blue-600 text-lg">
                  ¡Sigue así! 💪
                </span>
                <span className="text-sm text-slate-500 font-medium mt-1">
                  La semana pasada: <span className="text-slate-800 font-bold text-base">#{previousDisplay}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top 3 Podium - Rediseñado completamente */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mb-10"
      >
        {/* Título con más espacio vertical */}
        <h3 className="text-center text-xl sm:text-2xl font-bold text-foreground mb-8 sm:mb-10 flex items-center justify-center gap-2">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500" />
          Los 3 Mejores
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500" />
        </h3>
        
        <div className="flex items-end justify-center gap-4 sm:gap-6 md:gap-8 px-2">
          {/* 2nd Place - Plata */}
          {top3[1] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col items-center max-w-[100px] sm:max-w-[130px]"
            >
              {/* Avatar más grande y colorido */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 flex items-center justify-center mb-3 shadow-2xl ring-4 ring-gray-300/50 relative"
              >
                <span className="text-white font-black text-3xl sm:text-4xl drop-shadow-lg">
                  {top3[1].name.charAt(0)}
                </span>
                {/* Medalla grande */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                  <Medal className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
                </div>
              </motion.div>
              
              {/* Nombre completo en 2 líneas */}
              <p className="font-bold text-xs sm:text-sm text-center w-full mb-2 leading-tight px-1 min-h-[2.5rem] flex items-center justify-center">
                {top3[1].name}
              </p>
              
              {/* EXP grande y claro */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-yellow-50 px-3 py-2 rounded-full border-2 border-yellow-300 shadow-md mb-3">
                <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                <span className="font-bold text-sm sm:text-base text-yellow-700">{top3[1].exp}</span>
              </div>
              
              {/* Pedestal plateado */}
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "6rem" }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="w-24 sm:w-28 bg-gradient-to-t from-gray-500 via-gray-400 to-gray-300 rounded-t-2xl flex items-center justify-center shadow-xl border-t-4 border-white/50"
              >
                <span className="text-white font-black text-4xl drop-shadow-lg">2</span>
              </motion.div>
            </motion.div>
          )}

          {/* 1st Place - Oro (MÁS GRANDE Y DESTACADO) */}
          {top3[0] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col items-center max-w-[120px] sm:max-w-[150px] -mt-4 sm:-mt-6"
            >
              {/* Corona animada CON MÁS ESPACIO */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [-5, 5, -5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="mb-3"
              >
                <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 fill-yellow-500 drop-shadow-lg" />
              </motion.div>
              
              {/* Avatar GRANDE con animación */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(234, 179, 8, 0.5)",
                    "0 0 40px rgba(234, 179, 8, 0.8)",
                    "0 0 20px rgba(234, 179, 8, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center mb-3 shadow-2xl ring-4 ring-yellow-400/70 relative"
              >
                <span className="text-white font-black text-5xl sm:text-6xl drop-shadow-2xl">
                  {top3[0].name.charAt(0)}
                </span>
                {/* Etiqueta "¡Campeón!" */}
                <div className="absolute -bottom-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                  ¡Campeón!
                </div>
              </motion.div>
              
              {/* Nombre completo destacado en 2 líneas */}
              <p className="font-black text-sm sm:text-base text-center w-full mb-2 leading-tight text-yellow-700 px-1 min-h-[2.5rem] flex items-center justify-center">
                {top3[0].name}
              </p>
              
              {/* EXP muy visible */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 px-4 py-2.5 rounded-full border-2 border-yellow-500 shadow-lg mb-3">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="font-black text-base sm:text-lg text-white">{top3[0].exp}</span>
              </div>
              
              {/* Pedestal dorado MÁS ALTO */}
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "8rem" }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="w-28 sm:w-32 bg-gradient-to-t from-yellow-600 via-yellow-500 to-yellow-400 rounded-t-2xl flex items-center justify-center shadow-2xl border-t-4 border-white/50 relative overflow-hidden"
              >
                <span className="text-white font-black text-5xl drop-shadow-2xl z-10">1</span>
                {/* Brillos animados */}
                <motion.div
                  animate={{ x: [-100, 200] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </motion.div>
          )}

          {/* 3rd Place - Bronce */}
          {top3[2] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col items-center max-w-[100px] sm:max-w-[130px]"
            >
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 flex items-center justify-center mb-3 shadow-2xl ring-4 ring-amber-600/50 relative"
              >
                <span className="text-white font-black text-3xl sm:text-4xl drop-shadow-lg">
                  {top3[2].name.charAt(0)}
                </span>
                {/* Medalla */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                  <Medal className="w-7 h-7 sm:w-8 sm:h-8 text-amber-700" />
                </div>
              </motion.div>
              
              {/* Nombre completo en 2 líneas */}
              <p className="font-bold text-xs sm:text-sm text-center w-full mb-2 leading-tight px-1 min-h-[2.5rem] flex items-center justify-center">
                {top3[2].name}
              </p>
              
              {/* EXP */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-100 to-amber-50 px-3 py-2 rounded-full border-2 border-orange-300 shadow-md mb-3">
                <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                <span className="font-bold text-sm sm:text-base text-orange-700">{top3[2].exp}</span>
              </div>
              
              {/* Pedestal bronce */}
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "4.5rem" }}
                transition={{ delay: 1, duration: 0.5 }}
                className="w-24 sm:w-28 bg-gradient-to-t from-amber-800 via-amber-700 to-orange-600 rounded-t-2xl flex items-center justify-center shadow-xl border-t-4 border-white/50"
              >
                <span className="text-white font-black text-4xl drop-shadow-lg">3</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Rest of Rankings */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        {rest.map((entry, index) => (
          <div
            key={entry.position}
            className={cn(
              "flex items-center gap-4 p-4 transition-all",
              entry.isCurrentUser && "bg-primary/10 border-l-4 border-primary",
              index < rest.length - 1 && "border-b border-border"
            )}
          >
            <span className="w-8 text-center font-bold text-muted-foreground">
              {entry.position}
            </span>
            
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-tesla-blue-light flex items-center justify-center text-white font-bold shadow-md">
              {entry.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <p className={cn(
                "font-semibold",
                entry.isCurrentUser && "text-primary"
              )}>
                {entry.name}
                {entry.isCurrentUser && " (Tú)"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {getTrendIcon(entry.trend)}
              <div className="flex items-center gap-1 font-bold text-foreground">
                <Gem className="w-4 h-4 text-primary" />
                <span>{entry.exp} EXP</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        {totalStudents} estudiantes en la academia
      </p>

      <div className="mt-10">
        <RankingSemanal />
      </div>
    </div>
  );
};
