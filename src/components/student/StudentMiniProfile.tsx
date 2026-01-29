import { motion } from 'framer-motion';
import StudentCharacter3D from './StudentCharacter3D';
import { Badge } from '@/components/ui/badge';

interface StudentMiniProfileProps {
  userName: string;
  overallProgress: number;
  currentExp: number;
  className?: string;
}

const StudentMiniProfile = ({
  userName,
  overallProgress,
  currentExp,
  className = ''
}: StudentMiniProfileProps) => {
  
  // Get level based on progress
  const getStudentLevel = (progress: number): { level: string; color: string; emoji: string } => {
    if (progress < 25) return { level: "Explorador", color: "bg-blue-500", emoji: "🌟" };
    if (progress < 50) return { level: "Aprendiz", color: "bg-yellow-500", emoji: "📚" };
    if (progress < 75) return { level: "Estudiante", color: "bg-orange-500", emoji: "🎓" };
    return { level: "Experto", color: "bg-green-500", emoji: "👨‍🎓" };
  };

  const studentLevel = getStudentLevel(overallProgress);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      className={`flex items-center gap-3 ${className}`}
    >
      {/* Mini Character */}
      <div className="relative">
        <StudentCharacter3D 
          progress={overallProgress} 
          size="sm"
          showProgressText={false}
        />
        
        {/* Floating level badge */}
        <motion.div
          animate={{
            y: [0, -3, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-2 -right-2"
        >
          <Badge className={`${studentLevel.color} text-white text-xs px-2 py-1 shadow-lg`}>
            {studentLevel.emoji}
          </Badge>
        </motion.div>
      </div>

      {/* Student Info */}
      <div className="hidden sm:block">
        <div className="font-bold text-sm text-foreground">
          {userName}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">{studentLevel.level}</span>
          <span className="text-primary font-medium">{currentExp} EXP</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="w-16 bg-muted rounded-full h-1 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
          <span>{overallProgress}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentMiniProfile;