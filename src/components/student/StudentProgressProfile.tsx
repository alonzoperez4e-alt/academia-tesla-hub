import { motion } from 'framer-motion';
import StudentCharacter3D from './StudentCharacter3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Star } from 'lucide-react';

interface StudentProgressProfileProps {
  userName: string;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  totalExp: number;
  weeklyGoal: number;
}

const StudentProgressProfile = ({
  userName,
  overallProgress,
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
            className="flex justify-center"
          >
            <div className="relative">
              <StudentCharacter3D 
                progress={overallProgress} 
                size="lg"
                showProgressText={true}
              />
              
              {/* Floating stats around character */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  transition: { duration: 20, repeat: Infinity, ease: "linear" }
                }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* EXP Badge */}
                <motion.div
                  animate={{
                    rotate: [0, -360],
                    transition: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                  className="absolute -top-4 -right-8"
                >
                  <Badge className="bg-yellow-500 text-white px-3 py-1 font-bold shadow-lg">
                    <Star className="w-4 h-4 mr-1" />
                    {totalExp} EXP
                  </Badge>
                </motion.div>
                
                {/* Streak Badge */}
                <motion.div
                  animate={{
                    rotate: [0, -360],
                    transition: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                  className="absolute top-8 -left-12"
                >
                  <Badge className="bg-orange-500 text-white px-3 py-1 font-bold shadow-lg">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {currentStreak} días
                  </Badge>
                </motion.div>
                
                {/* Lessons Badge */}
                <motion.div
                  animate={{
                    rotate: [0, -360],
                    transition: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                  className="absolute -bottom-6 left-4"
                >
                  <Badge className="bg-green-500 text-white px-3 py-1 font-bold shadow-lg">
                    <Trophy className="w-4 h-4 mr-1" />
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
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-center text-foreground mb-6">
                  🌱 Etapas de Evolución de tu Personaje
                </h3>
                
                <div className="flex justify-between items-center mb-4">
                  {[
                    { threshold: 0, emoji: "🥚", label: "Huevo", description: "Inicio" },
                    { threshold: 25, emoji: "🐣", label: "Rompiendo", description: "Progreso" },
                    { threshold: 50, emoji: "🐤", label: "Naciendo", description: "Avanzando" },
                    { threshold: 75, emoji: "😊", label: "Crecido", description: "¡Experto!" }
                  ].map((stage, index) => (
                    <div key={stage.threshold} className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all duration-500 ${
                          overallProgress >= stage.threshold
                            ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {stage.emoji}
                      </motion.div>
                      <span className="text-xs font-medium text-center">{stage.label}</span>
                      <span className="text-xs text-muted-foreground text-center">{stage.description}</span>
                      
                      {index < 3 && (
                        <div className={`h-1 w-16 mx-2 rounded-full mt-2 transition-colors duration-500 ${
                          overallProgress >= [25, 50, 75][index] ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-center p-6 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl border border-primary/30"
          >
            <h4 className="font-bold text-lg text-primary mb-2">
              {overallProgress < 25 && "¡Comienza tu aventura de aprendizaje! 🚀"}
              {overallProgress >= 25 && overallProgress < 50 && "¡Excelente progreso! Sigue así 💪"}
              {overallProgress >= 50 && overallProgress < 75 && "¡Increíble! Tu personaje está creciendo 🌟"}
              {overallProgress >= 75 && "¡Eres increíble! Tu personaje ha evolucionado completamente 🎊"}
            </h4>
            <p className="text-muted-foreground">
              Cada lección completada hace que tu personaje crezca y evolucione. 
              ¡Continúa aprendiendo para desbloquear nuevas etapas!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StudentProgressProfile;