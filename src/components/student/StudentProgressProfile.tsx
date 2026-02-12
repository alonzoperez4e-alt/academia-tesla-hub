import { motion } from 'framer-motion';
import StudentCharacter3D from './StudentCharacter3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Star, User, IdCard, GraduationCap, Zap, Flame } from 'lucide-react';
import type { EstadoMascota } from '@/types/api.types';

interface StudentProgressProfileProps {
  userName: string;
  overallProgress: number;
  dinosaurProgress: number;
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  totalExp: number;
  weeklyGoal: number;
  userCode?: string;
  userArea?: string;
  petState?: EstadoMascota;
}

const StudentProgressProfile = ({
  userName,
  overallProgress,
  dinosaurProgress,
  completedLessons,
  totalLessons,
  currentStreak,
  totalExp,
  weeklyGoal,
  userCode,
  userArea,
  petState
}: StudentProgressProfileProps) => {
  
  // Get student level based on progress
  const getStudentLevel = (progress: number): { level: string; color: string; icon: string } => {
    if (progress < 25) return { level: "Explorador", color: "bg-blue-500", icon: "🌟" };
    if (progress < 50) return { level: "Aprendiz", color: "bg-yellow-500", icon: "📚" };
    if (progress < 75) return { level: "Estudiante", color: "bg-orange-500", icon: "🎓" };
    return { level: "Experto", color: "bg-green-500", icon: "👨‍🎓" };
  };

  const studentLevel = getStudentLevel(overallProgress);

  // Calculate progress towards weekly goal
  const weeklyProgress = Math.min((overallProgress / weeklyGoal) * 100, 100);

  const resolvedPetState: EstadoMascota = petState ?? 'Huevo';

  const stageConfig: { key: EstadoMascota; emoji: string; label: string; description: string }[] = [
    { key: 'Huevo', emoji: '🥚', label: 'Huevo', description: '0-1249 EXP' },
    { key: 'Agrietándose', emoji: '🐣', label: 'Agrietándose', description: '1250-2499 EXP' },
    { key: 'Naciendo', emoji: '🦖', label: 'Naciendo', description: '2500-3749 EXP' },
    { key: 'Completamente Crecido', emoji: '🦕', label: 'Completamente Crecido', description: '3750+ EXP' },
  ];

  const activeStageIndex = stageConfig.findIndex((stage) => stage.key === resolvedPetState);
  const normalizedStageIndex = activeStageIndex === -1 ? 0 : activeStageIndex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "backOut" }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-gradient-to-br from-primary/5 via-white to-accent/5 border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-foreground mb-2">
            ¡Hola, {userName}!
          </CardTitle>
          
          <p className="text-muted-foreground text-lg">
            Revisa tu progreso y continúa aprendiendo
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* ====== 1. INFORMACIÓN DEL PERFIL (Primero) ====== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gradient-to-br from-white to-primary/5 rounded-2xl p-5 sm:p-6 border border-primary/20 shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground">
                Información del Perfil
              </h3>
            </div>
            
            {/* Grid de información */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Código del estudiante */}
              {userCode && (
                <div className="bg-white/80 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IdCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Código de Estudiante</p>
                      <p className="font-bold text-base text-foreground">{userCode}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Área */}
              {userArea && (
                <div className="bg-white/80 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Área de Estudio</p>
                      <p className="font-bold text-base text-foreground">{userArea}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* EXP Total - Destacado */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border-2 border-yellow-300/50 hover:border-yellow-400 transition-all hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-400/20 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-yellow-700/70 mb-1">EXP Total Acumulado</p>
                    <div className="flex items-baseline gap-2">
                      <p className="font-bold text-2xl text-yellow-700">{totalExp}</p>
                      <span className="text-sm text-yellow-600/70">EXP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Racha Actual - Destacado */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50/50 rounded-xl p-4 border-2 border-orange-300/50 hover:border-orange-400 transition-all hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-400/20 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-orange-700/70 mb-1">Racha de Aprendizaje</p>
                    <div className="flex items-baseline gap-2">
                      <p className="font-bold text-2xl text-orange-600">{currentStreak}</p>
                      <span className="text-sm text-orange-500/70">días</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ====== 2. PROGRESO GENERAL Y META SEMANAL (Segundo) ====== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Overall Progress */}
            <Card className="bg-background/50 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Progreso General</h3>
                    <p className="text-sm text-muted-foreground">
                      {completedLessons} de {totalLessons} lecciones
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completado</span>
                    <span className="text-sm font-bold text-primary">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card className="bg-background/50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Meta Semanal</h3>
                    <p className="text-sm text-muted-foreground">
                      Objetivo: {weeklyGoal}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progreso</span>
                    <span className="text-sm font-bold text-blue-500">
                      {Math.round(weeklyProgress)}%
                    </span>
                  </div>
                  <Progress value={weeklyProgress} className="h-3" />
                  {weeklyProgress >= 100 && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm font-bold text-green-600 flex items-center gap-1"
                    >
                      <Star className="w-4 h-4" />
                      ¡Meta completada!
                    </motion.p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ====== 3. DINOSAURIO (Tercero) ====== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/30 border-2 border-yellow-400/50 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                {/* Contenedor vertical centrado - SIN animaciones flotantes */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: "backOut" }}
                  className="flex flex-col items-center gap-4 sm:gap-6"
                >
                  {/* 1. EXP Total - Arriba */}
                  <div className="flex justify-center gap-2">
                    <Badge className="bg-yellow-500 text-white px-4 py-2 text-sm sm:text-base font-bold shadow-lg">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {totalExp} EXP
                    </Badge>
                    <Badge className="bg-blue-500 text-white px-4 py-2 text-sm sm:text-base font-bold shadow-lg">
                      {resolvedPetState}
                    </Badge>
                  </div>

                  {/* 2. Dinosaurio - Centro */}
                  <div className="transform scale-100 sm:scale-105">
                    <StudentCharacter3D 
                      progress={dinosaurProgress} 
                      size="md"
                      showProgressText={false}
                    />
                  </div>

                  {/* 3. Progreso % - Debajo del dinosaurio */}
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {dinosaurProgress}%
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium">
                      Completado
                    </p>
                  </div>

                  {/* 4. Trofeos y Racha - Abajo en fila */}
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                    {/* Trofeo / Lecciones */}
                    <Badge className="bg-green-500 text-white px-3 py-2 text-sm sm:text-base font-bold shadow-lg">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {completedLessons}/{totalLessons}
                    </Badge>

                    {/* Racha */}
                    <Badge className="bg-orange-500 text-white px-3 py-2 text-sm sm:text-base font-bold shadow-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {currentStreak} días
                    </Badge>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Evolution Stages Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg text-center text-foreground mb-4 sm:mb-6">
                  🌱 Etapas de Evolución de tu Personaje
                </h3>
                
                {/* Grid responsive: 2 columnas en móvil, 4 en desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {stageConfig.map((stage, index) => {
                    const isActive = index === normalizedStageIndex;
                    const isCompleted = index < normalizedStageIndex;

                    return (
                      <div key={stage.key} className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-2 transition-all duration-500 ${
                            isCompleted
                              ? 'bg-green-500 text-white shadow-lg scale-105 ring-2 ring-green-300'
                              : isActive
                              ? 'bg-primary text-primary-foreground shadow-xl scale-110 ring-4 ring-primary/50 animate-pulse'
                              : 'bg-muted text-muted-foreground opacity-50'
                          }`}
                        >
                          {stage.emoji}
                        </motion.div>
                        
                        <span className={`text-xs sm:text-sm font-bold text-center mb-1 ${
                          isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {stage.label}
                        </span>
                        
                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">
                          {stage.description}
                        </span>
                        
                        {/* Estado visual */}
                        {isCompleted && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] sm:text-xs text-green-600 font-bold mt-1"
                          >
                            ✓ Completado
                          </motion.span>
                        )}
                        {isActive && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] sm:text-xs text-primary font-bold mt-1"
                          >
                            • Actual
                          </motion.span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Barra de progreso general por EXP */}
                <div className="mt-6 pt-4 border-t border-primary/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Progreso Total
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      {totalExp} / 5000 EXP
                    </span>
                  </div>
                  <Progress value={(totalExp / 5000) * 100} className="h-2 sm:h-3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StudentProgressProfile;