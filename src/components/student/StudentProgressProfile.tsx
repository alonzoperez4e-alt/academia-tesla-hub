import { motion } from 'framer-motion';
import StudentCharacter3D from './StudentCharacter3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Star } from 'lucide-react';

interface StudentProgressProfileProps {
  userName: string;
  overallProgress: number;
  dinosaurProgress: number;
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  totalExp: number;
  weeklyGoal: number;
}

const StudentProgressProfile = ({
  userName,
  overallProgress,
  dinosaurProgress,
  completedLessons,
  totalLessons,
  currentStreak,
  totalExp,
  weeklyGoal
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "backOut" }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-gradient-to-br from-primary/5 via-white to-accent/5 border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
          >
            <Badge className={`${studentLevel.color} text-white px-4 py-2 text-sm font-bold mb-3 inline-flex items-center gap-2`}>
              <span className="text-lg">{studentLevel.icon}</span>
              {studentLevel.level}
            </Badge>
          </motion.div>
          
          <CardTitle className="text-3xl font-bold text-foreground mb-2">
            ¡Hola, {userName}!
          </CardTitle>
          
          <p className="text-muted-foreground text-lg">
            Tu personaje está creciendo junto con tu aprendizaje
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Main Character Display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "backOut" }}
            className="flex justify-center py-4"
          >
            <div className="relative px-4 sm:px-8">
              {/* Dinosaurio con escala ligeramente aumentada (8%) */}
              <div className="transform scale-105 sm:scale-110">
                <StudentCharacter3D 
                  progress={dinosaurProgress} 
                  size="md"
                  showProgressText={true}
                />
              </div>
              
              {/* Floating stats around character - más sutiles y lentos */}
              <motion.div
                animate={{
                  rotate: [0, 360]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* EXP Badge - discreto */}
                <motion.div
                  animate={{
                    rotate: [0, -360]
                  }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-4 sm:-right-6 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <Badge className="bg-yellow-500 text-white px-2 py-1 text-xs sm:text-sm font-bold shadow-md">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {totalExp} EXP
                  </Badge>
                </motion.div>
                
                {/* Streak Badge - discreto */}
                <motion.div
                  animate={{
                    rotate: [0, -360]
                  }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute top-6 sm:top-8 -left-4 sm:-left-8 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <Badge className="bg-orange-500 text-white px-2 py-1 text-xs sm:text-sm font-bold shadow-md">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {currentStreak} días
                  </Badge>
                </motion.div>
                
                {/* Lessons Badge - discreto */}
                <motion.div
                  animate={{
                    rotate: [0, -360]
                  }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-4 sm:-bottom-6 left-2 sm:left-4 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <Badge className="bg-green-500 text-white px-2 py-1 text-xs sm:text-sm font-bold shadow-lg">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {completedLessons}/{totalLessons}
                  </Badge>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Progress Statistics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
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

          {/* Evolution Stages Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg text-center text-foreground mb-4 sm:mb-6">
                  🌱 Etapas de Evolución de tu Personaje
                </h3>
                
                {/* Grid responsive: 2 columnas en móvil, 4 en desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { expMin: 0, expMax: 1249, emoji: "🥚", label: "Huevo", description: "0-1249 EXP" },
                    { expMin: 1250, expMax: 2499, emoji: "🐣", label: "Rompiendo", description: "1250-2499 EXP" },
                    { expMin: 2500, expMax: 3749, emoji: "🦖", label: "Naciendo", description: "2500-3749 EXP" },
                    { expMin: 3750, expMax: 5000, emoji: "🦕", label: "Grande", description: "3750+ EXP" }
                  ].map((stage, index) => {
                    // Determinar el estado de la etapa basado en EXP
                    const isCompleted = totalExp > stage.expMax;
                    const isActive = totalExp >= stage.expMin && totalExp <= stage.expMax;
                    const isPending = totalExp < stage.expMin;
                    
                    return (
                      <div key={stage.expMin} className="flex flex-col items-center">
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