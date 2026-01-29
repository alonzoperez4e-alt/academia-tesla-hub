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
  // 0-24% = egg, 25-49% = cracking, 50-74% = hatching, 75-100% = grown
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
            
            {/* Progressive crack system - Breaking apart */}
            {/* First crack appears at 25% */}
            {crackIntensity > 0 && (
              <motion.path
                d={`M ${width * 0.5} ${height * 0.22} L ${width * 0.52} ${height * 0.35}`}
                stroke="#A0522D"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                filter="url(#crackDepth)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: Math.min(crackIntensity * 1.2, 1), 
                  opacity: 1 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
            
            {/* Second crack appears at 33% progress */}
            {crackIntensity > 0.33 && (
              <motion.path
                d={`M ${width * 0.52} ${height * 0.35} Q ${width * 0.58} ${height * 0.45} ${width * 0.65} ${height * 0.55}`}
                stroke="#A0522D"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                filter="url(#crackDepth)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: Math.min((crackIntensity - 0.33) * 1.5, 1), 
                  opacity: 1 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
            
            {/* Third crack appears at 50% progress */}
            {crackIntensity > 0.5 && (
              <motion.path
                d={`M ${width * 0.48} ${height * 0.35} Q ${width * 0.4} ${height * 0.48} ${width * 0.35} ${height * 0.6}`}
                stroke="#A0522D"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
                filter="url(#crackDepth)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: Math.min((crackIntensity - 0.5) * 2, 1), 
                  opacity: 1 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
            
            {/* Fourth crack - horizontal split appears at 66% */}
            {crackIntensity > 0.66 && (
              <motion.path
                d={`M ${width * 0.35} ${height * 0.5} L ${width * 0.65} ${height * 0.52}`}
                stroke="#8B4513"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
                filter="url(#crackDepth)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: Math.min((crackIntensity - 0.66) * 3, 1), 
                  opacity: 1 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
            
            {/* Small radiating cracks appear at 80% */}
            {crackIntensity > 0.8 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <path d={`M ${width * 0.52} ${height * 0.35} L ${width * 0.48} ${height * 0.3}`} stroke="#A0522D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d={`M ${width * 0.52} ${height * 0.35} L ${width * 0.58} ${height * 0.32}`} stroke="#A0522D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d={`M ${width * 0.65} ${height * 0.55} L ${width * 0.7} ${height * 0.52}`} stroke="#8B4513" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d={`M ${width * 0.35} ${height * 0.6} L ${width * 0.3} ${height * 0.58}`} stroke="#8B4513" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </motion.g>
            )}
            
            {/* Egg pieces separating at 90% */}
            {crackIntensity > 0.9 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Upper piece shifting */}
                <motion.ellipse 
                  cx={width * 0.5} 
                  cy={height * 0.3} 
                  rx={width * 0.25} 
                  ry={height * 0.15}
                  fill="url(#eggGradient3D)"
                  opacity="0.8"
                  animate={{ y: -3, x: 2, rotate: -5 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Side fragments */}
                <motion.ellipse 
                  cx={width * 0.7} 
                  cy={height * 0.55} 
                  rx="12" 
                  ry="8"
                  fill="#F0E6D3"
                  animate={{ x: 4, y: 2, rotate: 15 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.ellipse 
                  cx={width * 0.3} 
                  cy={height * 0.58} 
                  rx="10" 
                  ry="7"
                  fill="#E8DCC6"
                  animate={{ x: -3, y: 3, rotate: -12 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.g>
            )}
            
            {/* Highlight still visible but dimmed */}
            <ellipse
              cx={width * 0.4}
              cy={height * 0.32}
              rx={width * 0.1}
              ry={height * 0.07}
              fill="url(#highlightGradient)"
              opacity={0.6 - (crackIntensity * 0.4)}
            />
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
            
            {/* Emerging baby dinosaur character */}
            <motion.g
              initial={{ scale: 0.4, y: 25 }}
              animate={{ scale: 0.75, y: 0 }}
              transition={{ duration: 1, ease: "backOut" }}
            >
              {/* Small tail starting to show */}
              <path
                d={`M ${width * 0.38} ${height * 0.72} Q ${width * 0.32} ${height * 0.76} ${width * 0.3} ${height * 0.78}`}
                stroke="url(#characterBody)"
                strokeWidth={width * 0.05}
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Tiny tail spike */}
              <path
                d={`M ${width * 0.34} ${height * 0.74} L ${width * 0.32} ${height * 0.7} L ${width * 0.36} ${height * 0.73} Z`}
                fill="#228B22"
                opacity="0.8"
              />
              
              {/* Baby dinosaur body */}
              <ellipse
                cx={width * 0.49}
                cy={height * 0.65}
                rx={width * 0.16}
                ry={height * 0.2}
                fill="url(#characterBody)"
                filter="url(#characterGlow)"
              />
              
              {/* Small back spike */}
              <path
                d={`M ${width * 0.46} ${height * 0.52} L ${width * 0.44} ${height * 0.48} L ${width * 0.48} ${height * 0.5} Z`}
                fill="#228B22"
                opacity="0.9"
              />
              
              {/* Baby dinosaur head - slightly elongated */}
              <ellipse
                cx={width * 0.51}
                cy={height * 0.4}
                rx={width * 0.13}
                ry={width * 0.11}
                fill="url(#characterHead)"
                filter="url(#characterGlow)"
              />
              
              {/* Small snout */}
              <ellipse
                cx={width * 0.58}
                cy={height * 0.41}
                rx={width * 0.06}
                ry={width * 0.05}
                fill="url(#characterHead)"
              />
              
              {/* Happy eyes */}
              <circle cx={width * 0.47} cy={height * 0.38} r="3.5" fill="#2C1810" />
              <circle cx={width * 0.54} cy={height * 0.38} r="3.5" fill="#2C1810" />
              <circle cx={width * 0.48} cy={height * 0.37} r="1.8" fill="#FFFFFF" />
              <circle cx={width * 0.55} cy={height * 0.37} r="1.8" fill="#FFFFFF" />
              
              {/* Sweet smile */}
              <path
                d={`M ${width * 0.54} ${height * 0.43} Q ${width * 0.57} ${height * 0.45} ${width * 0.6} ${height * 0.44}`}
                stroke="#2C1810"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Tiny arms */}
              <ellipse cx={width * 0.38} cy={height * 0.6} rx={width * 0.04} ry={width * 0.06} fill="url(#characterBody)" />
              <ellipse cx={width * 0.6} cy={height * 0.6} rx={width * 0.04} ry={width * 0.06} fill="url(#characterBody)" />
              
              {/* Tiny legs */}
              <ellipse cx={width * 0.45} cy={height * 0.78} rx={width * 0.045} ry={height * 0.08} fill="url(#characterBody)" />
              <ellipse cx={width * 0.53} cy={height * 0.78} rx={width * 0.045} ry={height * 0.08} fill="url(#characterBody)" />
            </motion.g>
          </motion.g>
        );

      case 'grown':
        return (
          <motion.g
            animate={{
              y: [0, -4, 0],
              transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            style={{ transformOrigin: 'center center' }}
          >
            {/* Character shadow */}
            <ellipse
              cx={width * 0.5}
              cy={height * 0.93}
              rx={width * 0.35}
              ry="6"
              fill="url(#dropShadow)"
              opacity="0.4"
            />
            
            {/* Fully developed dinosaur - T-Rex style */}
            <motion.g
              animate={{
                rotate: [-0.3, 0.3, -0.3],
                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {/* Dinosaur tail - connected to body, curves behind */}
              <motion.g
                animate={{
                  rotate: [-3, 3, -3],
                  transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
                }}
                style={{ transformOrigin: `${width * 0.38}px ${height * 0.75}px` }}
              >
                {/* Tail base - thick part connecting to body */}
                <ellipse
                  cx={width * 0.38}
                  cy={height * 0.75}
                  rx={width * 0.07}
                  ry={height * 0.1}
                  fill="url(#dinoBody)"
                />
                
                {/* Tail middle section */}
                <path
                  d={`M ${width * 0.36} ${height * 0.75} Q ${width * 0.24} ${height * 0.78} ${width * 0.16} ${height * 0.82}`}
                  stroke="url(#dinoBody)"
                  strokeWidth={width * 0.09}
                  fill="none"
                  strokeLinecap="round"
                />
                
                {/* Tail tip - thinner */}
                <path
                  d={`M ${width * 0.16} ${height * 0.82} Q ${width * 0.09} ${height * 0.85} ${width * 0.05} ${height * 0.87}`}
                  stroke="url(#dinoBody)"
                  strokeWidth={width * 0.05}
                  fill="none"
                  strokeLinecap="round"
                />
                
                {/* Tail spikes/plates */}
                <path
                  d={`M ${width * 0.3} ${height * 0.76} L ${width * 0.28} ${height * 0.71} L ${width * 0.32} ${height * 0.745} Z`}
                  fill="#6B8E23"
                  filter="url(#spikeGlow)"
                />
                <path
                  d={`M ${width * 0.22} ${height * 0.79} L ${width * 0.2} ${height * 0.74} L ${width * 0.24} ${height * 0.775} Z`}
                  fill="#556B2F"
                  filter="url(#spikeGlow)"
                />
                <path
                  d={`M ${width * 0.13} ${height * 0.835} L ${width * 0.11} ${height * 0.79} L ${width * 0.15} ${height * 0.82} Z`}
                  fill="#6B8E23"
                  filter="url(#spikeGlow)"
                />
              </motion.g>
              
              {/* Back leg (behind body) */}
              <ellipse 
                cx={width * 0.46} 
                cy={height * 0.82} 
                rx={width * 0.07} 
                ry={height * 0.14} 
                fill="url(#dinoBody)" 
                opacity="0.85"
              />
              <ellipse 
                cx={width * 0.46} 
                cy={height * 0.92} 
                rx={width * 0.08} 
                ry={height * 0.05} 
                fill="url(#dinoBody)" 
                opacity="0.85"
              />
              
              {/* Main dinosaur body - large and rounded */}
              <ellipse
                cx={width * 0.52}
                cy={height * 0.7}
                rx={width * 0.21}
                ry={height * 0.25}
                fill="url(#dinoBody)"
                filter="url(#characterGlow)"
              />
              
              {/* Belly/chest - lighter color */}
              <ellipse
                cx={width * 0.54}
                cy={height * 0.74}
                rx={width * 0.14}
                ry={height * 0.18}
                fill="url(#dinoBelly)"
              />
              
              {/* Back plates/spikes running down spine */}
              <path
                d={`M ${width * 0.44} ${height * 0.52} L ${width * 0.42} ${height * 0.46} L ${width * 0.46} ${height * 0.505} Z`}
                fill="#6B8E23"
                filter="url(#spikeGlow)"
              />
              <path
                d={`M ${width * 0.5} ${height * 0.48} L ${width * 0.48} ${height * 0.42} L ${width * 0.52} ${height * 0.465} Z`}
                fill="#556B2F"
                filter="url(#spikeGlow)"
              />
              <path
                d={`M ${width * 0.56} ${height * 0.5} L ${width * 0.54} ${height * 0.44} L ${width * 0.58} ${height * 0.485} Z`}
                fill="#6B8E23"
                filter="url(#spikeGlow)"
              />
              
              {/* Neck - thick and muscular */}
              <ellipse
                cx={width * 0.57}
                cy={height * 0.52}
                rx={width * 0.12}
                ry={height * 0.14}
                fill="url(#dinoBody)"
              />
              
              {/* Dinosaur head - T-Rex style with large jaw */}
              <ellipse
                cx={width * 0.6}
                cy={height * 0.36}
                rx={width * 0.18}
                ry={height * 0.16}
                fill="url(#dinoHead)"
                filter="url(#characterGlow)"
              />
              
              {/* Upper jaw/snout */}
              <ellipse
                cx={width * 0.7}
                cy={height * 0.34}
                rx={width * 0.1}
                ry={height * 0.08}
                fill="url(#dinoHead)"
              />
              
              {/* Lower jaw */}
              <ellipse
                cx={width * 0.7}
                cy={height * 0.39}
                rx={width * 0.09}
                ry={height * 0.06}
                fill="url(#dinoHead)"
              />
              
              {/* Nostrils */}
              <circle cx={width * 0.76} cy={height * 0.33} r="2.5" fill="#4a3520" opacity="0.8" />
              
              {/* Eye - fierce but friendly */}
              <circle cx={width * 0.58} cy={height * 0.33} r="5" fill="#2C1810" />
              <circle cx={width * 0.595} cy={height * 0.32} r="2.5" fill="#FFFFFF" />
              
              {/* Eyebrow ridge - for character */}
              <path
                d={`M ${width * 0.54} ${height * 0.3} Q ${width * 0.58} ${height * 0.29} ${width * 0.62} ${height * 0.3}`}
                stroke="#556B2F"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Mouth line */}
              <path
                d={`M ${width * 0.67} ${height * 0.37} Q ${width * 0.72} ${height * 0.385} ${width * 0.76} ${height * 0.38}`}
                stroke="#4a3520"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Teeth - small hints */}
              <path
                d={`M ${width * 0.7} ${height * 0.37} L ${width * 0.7} ${height * 0.39}`}
                stroke="#FFFACD"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d={`M ${width * 0.73} ${height * 0.375} L ${width * 0.73} ${height * 0.395}`}
                stroke="#FFFACD"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              
              {/* Small arms - T-Rex style */}
              <motion.g
                animate={{
                  rotate: [-8, 8, -8],
                  transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ transformOrigin: `${width * 0.4}px ${height * 0.62}px` }}
              >
                <ellipse cx={width * 0.4} cy={height * 0.64} rx={width * 0.045} ry={height * 0.09} fill="url(#dinoBody)" />
                {/* Two clawed fingers */}
                <path
                  d={`M ${width * 0.385} ${height * 0.72} L ${width * 0.375} ${height * 0.75}`}
                  stroke="#6B8E23"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d={`M ${width * 0.4} ${height * 0.73} L ${width * 0.39} ${height * 0.76}`}
                  stroke="#6B8E23"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </motion.g>
              
              {/* Front leg - powerful */}
              <ellipse cx={width * 0.6} cy={height * 0.84} rx={width * 0.075} ry={height * 0.14} fill="url(#dinoBody)" />
              {/* Front foot */}
              <ellipse cx={width * 0.6} cy={height * 0.94} rx={width * 0.09} ry={height * 0.05} fill="url(#dinoBody)" />
              
              {/* Claws on front foot */}
              <path
                d={`M ${width * 0.54} ${height * 0.95} L ${width * 0.52} ${height * 0.97}`}
                stroke="#4a3520"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={`M ${width * 0.6} ${height * 0.96} L ${width * 0.6} ${height * 0.98}`}
                stroke="#4a3520"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={`M ${width * 0.66} ${height * 0.95} L ${width * 0.68} ${height * 0.97}`}
                stroke="#4a3520"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </motion.g>
            
            {/* Success sparkles - smaller and more subtle */}
            <motion.g
              animate={{
                scale: [0.9, 1.2, 0.9],
                opacity: [0.5, 0.9, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <circle cx={width * 0.2} cy={height * 0.3} r="3" fill="#FFD700" opacity="0.7" />
              <circle cx={width * 0.85} cy={height * 0.45} r="2.5" fill="#FFA500" opacity="0.7" />
              <circle cx={width * 0.15} cy={height * 0.6} r="2" fill="#FFD700" opacity="0.6" />
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
    <div className={`flex flex-col items-center ${className}`}>
      <div style={{ transform: `scale(${scale})` }} className="flex justify-center">
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
            
            {/* Character body gradient - baby dino (green) */}
            <radialGradient id="characterBody" cx="0.25" cy="0.2" r="0.85">
              <stop offset="0%" stopColor="#90EE90" />
              <stop offset="50%" stopColor="#32CD32" />
              <stop offset="100%" stopColor="#228B22" />
            </radialGradient>
            
            {/* Character head gradient - baby dino (green) */}
            <radialGradient id="characterHead" cx="0.25" cy="0.15" r="0.9">
              <stop offset="0%" stopColor="#98FB98" />
              <stop offset="50%" stopColor="#90EE90" />
              <stop offset="100%" stopColor="#32CD32" />
            </radialGradient>
            
            {/* Adult dinosaur body gradient - realistic olive/forest green */}
            <radialGradient id="dinoBody" cx="0.3" cy="0.25" r="0.9">
              <stop offset="0%" stopColor="#9ACD32" />
              <stop offset="40%" stopColor="#6B8E23" />
              <stop offset="100%" stopColor="#556B2F" />
            </radialGradient>
            
            {/* Adult dinosaur head gradient */}
            <radialGradient id="dinoHead" cx="0.3" cy="0.2" r="0.85">
              <stop offset="0%" stopColor="#ADFF2F" />
              <stop offset="50%" stopColor="#9ACD32" />
              <stop offset="100%" stopColor="#6B8E23" />
            </radialGradient>
            
            {/* Adult dinosaur belly gradient - lighter */}
            <radialGradient id="dinoBelly" cx="0.4" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#F0E68C" />
              <stop offset="60%" stopColor="#BDB76B" />
              <stop offset="100%" stopColor="#8B8B7A" opacity="0.7" />
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
            
            <filter id="spikeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(34,139,34,0.4)" />
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
            {Math.round(progress)}% Completado
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