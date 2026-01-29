import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface StudentCharacter3DProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showProgressText?: boolean;
  className?: string;
}

const StudentCharacter3D = ({ 
  progress, 
  size = 'md', 
  showProgressText = true,
  className = '' 
}: StudentCharacter3DProps) => {
  
  // Determine stage based on progress
  const stage = useMemo(() => {
    if (progress < 25) return 'egg';
    if (progress < 50) return 'cracking';
    if (progress < 75) return 'hatching';
    return 'grown';
  }, [progress]);

  // Size configurations
  const sizeConfig = {
    sm: { width: 100, height: 120, scale: 0.7 },
    md: { width: 140, height: 170, scale: 1 },
    lg: { width: 180, height: 220, scale: 1.3 }
  };

  const { width, height, scale } = sizeConfig[size];

  // Floating animation - continuous gentle movement
  const floatAnimation = {
    y: [0, -6, 0],
    rotate: [0, 1, -1, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
      repeatType: "loop" as const
    }
  };

  // Breathing animation for character
  const breatheAnimation = {
    scale: [1, 1.03, 1],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
      repeatType: "loop" as const
    }
  };

  // Calculate crack intensity for progressive breaking
  const crackIntensity = stage === 'cracking' ? Math.min((progress - 25) / 25, 1) : 0;

  const renderCharacterStage = () => {
    switch (stage) {
      case 'egg':
        return (
          <motion.g
            animate={floatAnimation}
            style={{ transformOrigin: 'center center' }}
          >
            {/* Soft drop shadow */}
            <ellipse
              cx={width / 2}
              cy={height * 0.9}
              rx={width * 0.3}
              ry="6"
              fill="url(#dropShadow)"
              opacity="0.2"
            />
            
            {/* Main egg body with 3D gradient */}
            <ellipse
              cx={width / 2}
              cy={height * 0.5}
              rx={width * 0.32}
              ry={height * 0.38}
              fill="url(#eggGradient3D)"
              filter="url(#eggGlow)"
            />
            
            {/* Primary highlight for 3D effect */}
            <ellipse
              cx={width * 0.4}
              cy={height * 0.32}
              rx={width * 0.1}
              ry={height * 0.07}
              fill="url(#highlightGradient)"
              opacity="0.85"
            />
            
            {/* Secondary smaller highlight */}
            <ellipse
              cx={width * 0.37}
              cy={height * 0.29}
              rx={width * 0.04}
              ry={height * 0.03}
              fill="rgba(255,255,255,0.95)"
            />
            
            {/* Subtle surface texture */}
            <path
              d={`M ${width * 0.28} ${height * 0.42} Q ${width * 0.5} ${height * 0.4} ${width * 0.72} ${height * 0.44}`}
              stroke="rgba(240,230,210,0.4)"
              strokeWidth="0.8"
              fill="none"
            />
          </motion.g>
        );

      case 'cracking':
        return (
          <motion.g
            animate={floatAnimation}
            style={{ transformOrigin: 'center center' }}
          >
            {/* Drop shadow */}
            <ellipse
              cx={width / 2}
              cy={height * 0.9}
              rx={width * 0.3}
              ry="6"
              fill="url(#dropShadow)"
              opacity="0.2"
            />
            
            {/* Main egg body */}
            <ellipse
              cx={width / 2}
              cy={height * 0.5}
              rx={width * 0.32}
              ry={height * 0.38}
              fill="url(#eggGradient3D)"
              filter="url(#eggGlow)"
            />
            
            {/* Progressive crack system */}
            <motion.g
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: crackIntensity, opacity: crackIntensity * 0.9 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Main vertical crack */}
              <path
                d={`M ${width * 0.62} ${height * 0.26} Q ${width * 0.68} ${height * 0.48} ${width * 0.74} ${height * 0.68}`}
                stroke="#A0522D"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
                filter="url(#crackDepth)"
              />
              
              {/* Secondary crack */}
              <path
                d={`M ${width * 0.32} ${height * 0.38} Q ${width * 0.24} ${height * 0.55} ${width * 0.28} ${height * 0.74}`}
                stroke="#A0522D"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                pathLength={crackIntensity * 0.75}
              />
              
              {/* Tertiary smaller crack */}
              <path
                d={`M ${width * 0.48} ${height * 0.28} L ${width * 0.52} ${height * 0.62}`}
                stroke="#8B4513"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
                pathLength={crackIntensity * 0.5}
              />
            </motion.g>
            
            {/* Highlight still visible but dimmed */}
            <ellipse
              cx={width * 0.4}
              cy={height * 0.32}
              rx={width * 0.1}
              ry={height * 0.07}
              fill="url(#highlightGradient)"
              opacity="0.6"
            />
            
            {/* Small shell fragments beginning to fall */}
            {crackIntensity > 0.6 && (
              <motion.g
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: 8, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <ellipse cx={width * 0.76} cy={height * 0.75} rx="5" ry="3" fill="#F0E6D3" />
                <ellipse cx={width * 0.22} cy={height * 0.72} rx="4" ry="2.5" fill="#E8DCC6" />
              </motion.g>
            )}
          </motion.g>
        );

      case 'hatching':
        return (
          <motion.g
            animate={floatAnimation}
            style={{ transformOrigin: 'center center' }}
          >
            {/* Larger shell pieces at bottom */}
            <motion.g
              initial={{ y: 0, scale: 0.8 }}
              animate={{ y: 12, scale: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
            >
              <ellipse cx={width * 0.28} cy={height * 0.85} rx="20" ry="12" fill="url(#shellFragment)" />
              <ellipse cx={width * 0.72} cy={height * 0.88} rx="16" ry="9" fill="url(#shellFragment)" />
              <ellipse cx={width * 0.5} cy={height * 0.92} rx="14" ry="7" fill="#F5E6D3" />
              <ellipse cx={width * 0.35} cy={height * 0.89} rx="9" ry="5" fill="#E8DCC6" />
            </motion.g>
            
            {/* Character shadow */}
            <ellipse
              cx={width / 2}
              cy={height * 0.85}
              rx={width * 0.22}
              ry="7"
              fill="url(#dropShadow)"
              opacity="0.3"
            />
            
            {/* Emerging baby character */}
            <motion.g
              initial={{ scale: 0.4, y: 25 }}
              animate={{ scale: 0.75, y: 0 }}
              transition={{ duration: 1, ease: "backOut" }}
            >
              {/* Character body */}
              <ellipse
                cx={width / 2}
                cy={height * 0.65}
                rx={width * 0.16}
                ry={height * 0.2}
                fill="url(#characterBody)"
                filter="url(#characterGlow)"
              />
              
              {/* Character head */}
              <circle
                cx={width / 2}
                cy={height * 0.4}
                r={width * 0.13}
                fill="url(#characterHead)"
                filter="url(#characterGlow)"
              />
              
              {/* Happy eyes */}
              <circle cx={width * 0.45} cy={height * 0.38} r="3.5" fill="#2C1810" />
              <circle cx={width * 0.55} cy={height * 0.38} r="3.5" fill="#2C1810" />
              <circle cx={width * 0.46} cy={height * 0.37} r="1.8" fill="#FFFFFF" />
              <circle cx={width * 0.56} cy={height * 0.37} r="1.8" fill="#FFFFFF" />
              
              {/* Sweet smile */}
              <ellipse
                cx={width / 2}
                cy={height * 0.44}
                rx="5"
                ry="2.5"
                fill="#FF8FA3"
              />
              
              {/* Tiny arms */}
              <circle cx={width * 0.36} cy={height * 0.6} r={width * 0.055} fill="url(#characterBody)" />
              <circle cx={width * 0.64} cy={height * 0.6} r={width * 0.055} fill="url(#characterBody)" />
            </motion.g>
          </motion.g>
        );

      case 'grown':
        return (
          <motion.g
            animate={{
              ...floatAnimation,
              ...breatheAnimation
            }}
            style={{ transformOrigin: 'center center' }}
          >
            {/* Character shadow */}
            <ellipse
              cx={width / 2}
              cy={height * 0.92}
              rx={width * 0.28}
              ry="8"
              fill="url(#dropShadow)"
              opacity="0.35"
            />
            
            {/* Fully developed character */}
            <motion.g
              animate={{
                rotate: [-0.5, 0.5, -0.5],
                transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {/* Character body */}
              <ellipse
                cx={width / 2}
                cy={height * 0.68}
                rx={width * 0.17}
                ry={height * 0.22}
                fill="url(#characterBody)"
                filter="url(#characterGlow)"
              />
              
              {/* Character head */}
              <circle
                cx={width / 2}
                cy={height * 0.38}
                r={width * 0.15}
                fill="url(#characterHead)"
                filter="url(#characterGlow)"
              />
              
              {/* Joyful closed eyes */}
              <path
                d={`M ${width * 0.43} ${height * 0.36} Q ${width * 0.45} ${height * 0.39} ${width * 0.47} ${height * 0.36}`}
                stroke="#2C1810"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M ${width * 0.53} ${height * 0.36} Q ${width * 0.55} ${height * 0.39} ${width * 0.57} ${height * 0.36}`}
                stroke="#2C1810"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Big happy smile */}
              <path
                d={`M ${width * 0.4} ${height * 0.44} Q ${width / 2} ${height * 0.49} ${width * 0.6} ${height * 0.44}`}
                stroke="#FF69B4"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Arms raised in triumph */}
              <circle cx={width * 0.28} cy={height * 0.58} r={width * 0.065} fill="url(#characterBody)" />
              <circle cx={width * 0.72} cy={height * 0.58} r={width * 0.065} fill="url(#characterBody)" />
              
              {/* Legs */}
              <ellipse cx={width * 0.43} cy={height * 0.82} rx={width * 0.055} ry={height * 0.09} fill="url(#characterBody)" />
              <ellipse cx={width * 0.57} cy={height * 0.82} rx={width * 0.055} ry={height * 0.09} fill="url(#characterBody)" />
              
              {/* Simple hair detail */}
              <path
                d={`M ${width * 0.4} ${height * 0.28} Q ${width / 2} ${height * 0.24} ${width * 0.6} ${height * 0.28}`}
                stroke="#D2691E"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
            </motion.g>
            
            {/* Celebration sparkles */}
            <motion.g
              animate={{
                scale: [0.8, 1.4, 0.8],
                opacity: [0.4, 1, 0.4],
                rotate: [0, 360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop"
              }}
            >
              <polygon
                points={`${width * 0.2},${height * 0.25} ${width * 0.22},${height * 0.28} ${width * 0.2},${height * 0.31} ${width * 0.18},${height * 0.28}`}
                fill="#FFD700"
              />
              <polygon
                points={`${width * 0.8},${height * 0.4} ${width * 0.82},${height * 0.43} ${width * 0.8},${height * 0.46} ${width * 0.78},${height * 0.43}`}
                fill="#FFD700"
              />
              <polygon
                points={`${width * 0.15},${height * 0.65} ${width * 0.17},${height * 0.68} ${width * 0.15},${height * 0.71} ${width * 0.13},${height * 0.68}`}
                fill="#FFA500"
              />
              <polygon
                points={`${width * 0.85},${height * 0.2} ${width * 0.87},${height * 0.23} ${width * 0.85},${height * 0.26} ${width * 0.83},${height * 0.23}`}
                fill="#FF69B4"
              />
            </motion.g>
          </motion.g>
        );

      default:
        return null;
    }
  };

  // Get motivational message based on progress and stage
  const getMotivationalMessage = () => {
    switch (stage) {
      case 'egg': return "¡Tu aventura de aprendizaje está comenzando!";
      case 'cracking': return "¡Excelente! Tu conocimiento está creciendo";
      case 'hatching': return "¡Increíble! Tu personaje está naciendo";
      case 'grown': return "¡Felicitaciones! Eres un estudiante experto";
      default: return "";
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <div style={{ transform: `scale(${scale})` }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          style={{ background: 'transparent', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
        >
          <defs>
            {/* 3D Egg gradient */}
            <radialGradient id="eggGradient3D" cx="0.25" cy="0.15" r="0.9">
              <stop offset="0%" stopColor="#FFFBF0" />
              <stop offset="35%" stopColor="#F8F0E3" />
              <stop offset="70%" stopColor="#F0E6D3" />
              <stop offset="100%" stopColor="#E8DCC6" />
            </radialGradient>
            
            {/* Highlight gradient for 3D effect */}
            <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
            
            {/* Character body gradient */}
            <radialGradient id="characterBody" cx="0.25" cy="0.2" r="0.85">
              <stop offset="0%" stopColor="#FFE7EA" />
              <stop offset="50%" stopColor="#FFCCD5" />
              <stop offset="100%" stopColor="#FF8FA3" />
            </radialGradient>
            
            {/* Character head gradient */}
            <radialGradient id="characterHead" cx="0.25" cy="0.15" r="0.9">
              <stop offset="0%" stopColor="#FFF0F5" />
              <stop offset="50%" stopColor="#FFE7EA" />
              <stop offset="100%" stopColor="#FFCCD5" />
            </radialGradient>
            
            {/* Shell fragment gradient */}
            <linearGradient id="shellFragment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="100%" stopColor="#E0D0BD" />
            </linearGradient>
            
            {/* Shadow gradient */}
            <radialGradient id="dropShadow" cx="0.5" cy="0.2" r="0.8">
              <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            
            {/* 3D Effect filters */}
            <filter id="eggGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="rgba(0,0,0,0.15)" />
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="rgba(255,255,255,0.4)" />
            </filter>
            
            <filter id="characterGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.12)" />
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(255,143,163,0.3)" />
            </filter>
            
            <filter id="crackDepth" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="rgba(0,0,0,0.5)" />
            </filter>
          </defs>
          
          <AnimatePresence mode="wait">
            <motion.g
              key={stage}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.6, ease: "backOut" }}
            >
              {renderCharacterStage()}
            </motion.g>
          </AnimatePresence>
        </svg>
      </div>
      
      {/* Progress text and motivation */}
      {showProgressText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-3"
        >
          <div className="text-sm font-bold text-primary mb-1">
            {progress}% Completado
          </div>
          <div className="text-xs text-muted-foreground">
            {getMotivationalMessage()}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentCharacter3D;