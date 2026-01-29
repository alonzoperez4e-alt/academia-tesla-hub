import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StreakMascotProps {
  streakDays: number;
  className?: string;
}

const getState = (days: number) => {
  if (days >= 30) return 4;
  if (days >= 7) return 3;
  if (days >= 3) return 2;
  return 1;
};

const getNextMilestone = (days: number) => {
  if (days >= 30) return { target: 30, label: "¡Completado!" };
  if (days >= 7) return { target: 30, label: "Día 30" };
  if (days >= 3) return { target: 7, label: "Día 7" };
  return { target: 3, label: "Día 3" };
};

const getMotivationalMessage = (state: number, days: number) => {
  switch (state) {
    case 1:
      return days === 0 ? "¡Comienza tu racha!" : "¡Sigue así, pronto eclosionará!";
    case 2:
      return "¡Ya casi nace! ¡No te rindas!";
    case 3:
      return "¡Hola! ¡Sigamos aprendiendo juntos!";
    case 4:
      return "¡Eres increíble! ¡Campeón del aprendizaje!";
    default:
      return "¡Vamos!";
  }
};

export const StreakMascot = ({ streakDays, className }: StreakMascotProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const state = getState(streakDays);
  const milestone = getNextMilestone(streakDays);
  const message = getMotivationalMessage(state, streakDays);

  // Calculate progress to next milestone
  const getPreviousMilestone = () => {
    if (streakDays >= 30) return 30;
    if (streakDays >= 7) return 7;
    if (streakDays >= 3) return 3;
    return 0;
  };

  const prevMilestone = getPreviousMilestone();
  const progress = milestone.target === 30 && streakDays >= 30 
    ? 100 
    : ((streakDays - prevMilestone) / (milestone.target - prevMilestone)) * 100;

  // Show confetti on milestones
  useEffect(() => {
    if (streakDays === 7 || streakDays === 30) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [streakDays]);

  const renderEgg = () => (
    <motion.div
      className="relative w-32 h-40"
      whileHover={{ rotate: [-2, 2, -2, 0] }}
      transition={{ duration: 0.5 }}
    >
      {/* Egg Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/10 rounded-full blur-sm" />
      
      {/* Egg Body */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#F5E6D3] via-[#E8D4BE] to-[#D4C4A8] rounded-[50%] rounded-b-[60%] shadow-xl"
        style={{
          boxShadow: "inset -8px -8px 20px rgba(0,0,0,0.1), inset 8px 8px 20px rgba(255,255,255,0.5), 0 10px 30px rgba(0,0,0,0.15)"
        }}
      />
      
      {/* Egg Highlight */}
      <div className="absolute top-4 left-6 w-8 h-12 bg-white/30 rounded-full blur-sm rotate-[-20deg]" />
      
      {/* Subtle Pattern */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#C4B498]/30 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#C4B498]/20 rounded-full" />
    </motion.div>
  );

  const renderCrackingEgg = () => (
    <motion.div
      className="relative w-32 h-40"
      animate={{ x: [0, -2, 2, -2, 2, 0] }}
      transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
    >
      {/* Egg Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/10 rounded-full blur-sm" />
      
      {/* Egg Body */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#F5E6D3] via-[#E8D4BE] to-[#D4C4A8] rounded-[50%] rounded-b-[60%] shadow-xl"
        style={{
          boxShadow: "inset -8px -8px 20px rgba(0,0,0,0.1), inset 8px 8px 20px rgba(255,255,255,0.5), 0 10px 30px rgba(0,0,0,0.15)"
        }}
      />
      
      {/* Cracks with glowing teal */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 120">
        {/* Main Crack */}
        <motion.path
          d="M50 20 L48 35 L55 45 L47 55 L52 65"
          stroke="#20B2AA"
          strokeWidth="3"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        {/* Secondary Cracks */}
        <path
          d="M55 45 L62 50"
          stroke="#20B2AA"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
        />
        <path
          d="M47 55 L40 58"
          stroke="#20B2AA"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
        />
        {/* Glow Filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Glowing spots through cracks */}
      <motion.div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#20B2AA] rounded-full blur-md"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    </motion.div>
  );

  const renderHatchingDino = () => (
    <motion.div className="relative w-36 h-44">
      {/* Broken Egg Shell (Bottom) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-16">
        <div
          className="w-full h-full bg-gradient-to-b from-[#F5E6D3] to-[#D4C4A8] rounded-b-[60%] rounded-t-none"
          style={{
            clipPath: "polygon(0% 100%, 5% 60%, 15% 40%, 25% 55%, 40% 30%, 55% 50%, 70% 35%, 85% 55%, 95% 45%, 100% 100%)",
            boxShadow: "inset -4px -4px 10px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.1)"
          }}
        />
      </div>

      {/* Dino Head */}
      <motion.div
        className="absolute top-2 left-1/2 -translate-x-1/2"
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        {/* Head */}
        <div className="relative">
          {/* Main Head */}
          <div className="w-20 h-20 bg-gradient-to-b from-[#20B2AA] to-[#1A9A94] rounded-[50%] rounded-b-[40%] shadow-lg">
            {/* Eyes */}
            <div className="absolute top-5 left-3 w-5 h-5 bg-white rounded-full shadow-inner">
              <div className="absolute top-1 left-1 w-3 h-3 bg-[#2C3E50] rounded-full">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
            <div className="absolute top-5 right-3 w-5 h-5 bg-white rounded-full shadow-inner">
              <div className="absolute top-1 left-1 w-3 h-3 bg-[#2C3E50] rounded-full">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
            
            {/* Smile */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-3 border-b-2 border-[#1A7A74] rounded-b-full" />
            
            {/* Blush */}
            <div className="absolute bottom-5 left-1 w-3 h-2 bg-pink-300/40 rounded-full blur-[1px]" />
            <div className="absolute bottom-5 right-1 w-3 h-2 bg-pink-300/40 rounded-full blur-[1px]" />
          </div>
          
          {/* T-Shirt Collar Visible */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#4169E1] rounded-b-lg" />
        </div>
      </motion.div>
    </motion.div>
  );

  const renderFullDino = () => (
    <motion.div
      className="relative w-40 h-52"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", repeatDelay: 2 }}
      >
        {/* Body */}
        <div className="relative">
          {/* T-Shirt Body */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-24 h-20 bg-gradient-to-b from-[#4169E1] to-[#3557C9] rounded-lg shadow-lg">
            {/* Logo on Shirt */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-inner">
              <div className="w-7 h-7 rounded-full border-2 border-[#4169E1] flex items-center justify-center">
                <span className="text-[#4169E1] font-bold text-sm">T</span>
              </div>
            </div>
          </div>

          {/* Shorts */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-20 h-10 bg-gradient-to-b from-[#F5E6D3] to-[#E8D4BE] rounded-b-lg shadow-md" />
          
          {/* Legs */}
          <div className="absolute top-40 left-8 w-6 h-10 bg-gradient-to-b from-[#20B2AA] to-[#1A9A94] rounded-b-xl" />
          <div className="absolute top-40 right-8 w-6 h-10 bg-gradient-to-b from-[#20B2AA] to-[#1A9A94] rounded-b-xl" />

          {/* Arms */}
          <motion.div
            className="absolute top-20 -left-2 w-5 h-12 bg-gradient-to-b from-[#20B2AA] to-[#1A9A94] rounded-full origin-top"
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
          />
          <motion.div
            className="absolute top-20 -right-2 w-5 h-12 bg-gradient-to-b from-[#20B2AA] to-[#1A9A94] rounded-full origin-top"
            animate={{ rotate: [0, -15, 0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
          />

          {/* Head */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="w-24 h-20 bg-gradient-to-b from-[#20B2AA] to-[#1A9A94] rounded-[50%] rounded-b-[40%] shadow-lg">
              {/* Eyes */}
              <div className="absolute top-4 left-3 w-6 h-6 bg-white rounded-full shadow-inner">
                <motion.div
                  className="absolute top-1 left-1.5 w-3.5 h-3.5 bg-[#2C3E50] rounded-full"
                  animate={{ x: [0, 1, 0, -1, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                </motion.div>
              </div>
              <div className="absolute top-4 right-3 w-6 h-6 bg-white rounded-full shadow-inner">
                <motion.div
                  className="absolute top-1 left-1.5 w-3.5 h-3.5 bg-[#2C3E50] rounded-full"
                  animate={{ x: [0, 1, 0, -1, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                </motion.div>
              </div>
              
              {/* Happy Smile */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-5 border-b-3 border-[#1A7A74] rounded-b-full overflow-hidden">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-pink-400 rounded-t-full" />
              </div>
              
              {/* Blush */}
              <div className="absolute bottom-5 left-1 w-4 h-2 bg-pink-300/40 rounded-full blur-[1px]" />
              <div className="absolute bottom-5 right-1 w-4 h-2 bg-pink-300/40 rounded-full blur-[1px]" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderMascot = () => {
    switch (state) {
      case 1:
        return renderEgg();
      case 2:
        return renderCrackingEgg();
      case 3:
        return renderHatchingDino();
      case 4:
        return renderFullDino();
      default:
        return renderEgg();
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ["#FFD700", "#20B2AA", "#4169E1", "#FF6B6B", "#9B59B6"][Math.floor(Math.random() * 5)],
                  borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                }}
                initial={{ top: "-10%", rotate: 0, opacity: 1 }}
                animate={{
                  top: "110%",
                  rotate: Math.random() * 720 - 360,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut",
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Speech Bubble */}
      <motion.div
        className="relative bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-primary/20 mb-4"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <p className="text-sm font-medium text-foreground text-center">{message}</p>
        {/* Bubble Tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-primary/20 rotate-45" />
      </motion.div>

      {/* Mascot */}
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {renderMascot()}
      </motion.div>

      {/* Progress Section */}
      <div className="w-full max-w-[200px] mt-4 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Día {streakDays}</span>
          <span>{milestone.label}</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">
          {state < 4 
            ? `${milestone.target - streakDays} días para el siguiente nivel`
            : "¡Nivel máximo alcanzado!"}
        </p>
      </div>
    </div>
  );
};
