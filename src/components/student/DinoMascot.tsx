import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

// ============================================
// TIPOS Y CONFIGURACIÓN
// ============================================

export type DinoStage = 'egg' | 'cracking' | 'hatching' | 'grown';

interface DinoMascotProps {
  stage: DinoStage; // Etapa actual (controlada externamente)
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onInteraction?: () => void; // Callback opcional cuando se toca
}

interface TimeState {
  isSleepTime: boolean;
  currentHour: number;
}

// ============================================
// HOOK: Detección de modo noche en tiempo real
// ============================================

function useSleepMode(): TimeState {
  const [timeState, setTimeState] = useState<TimeState>(() => {
    const now = new Date();
    const hour = now.getHours();
    return {
      currentHour: hour,
      isSleepTime: hour >= 0 && hour < 6 // 12:00 AM - 6:00 AM
    };
  });

  useEffect(() => {
    // Función para actualizar estado basado en hora actual
    const updateTimeState = () => {
      const now = new Date();
      const hour = now.getHours();
      const isSleepTime = hour >= 0 && hour < 6;
      
      setTimeState(prev => {
        // Solo actualizar si cambió el estado de sueño
        if (prev.isSleepTime !== isSleepTime) {
          return { currentHour: hour, isSleepTime };
        }
        return prev;
      });
    };

    // Actualizar cada minuto para detectar cambios de hora
    const interval = setInterval(updateTimeState, 60000); // 1 minuto

    // Verificar inmediatamente al montar
    updateTimeState();

    return () => clearInterval(interval);
  }, []);

  return timeState;
}

// ============================================
// HOOK: Control de interacción con bloqueo
// ============================================

function useInteractionLock() {
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false); // Ref para evitar dependencias circulares
  const controls = useAnimation();

  const triggerAction = useCallback(async () => {
    // Guard: Si ya está animando, ignorar input
    if (isAnimatingRef.current) {
      console.log('[DinoMascot] Animación en progreso, input ignorado');
      return;
    }

    console.log('[DinoMascot] Iniciando animación...');
    
    // Bloquear ANTES de iniciar animación
    isAnimatingRef.current = true;
    setIsAnimating(true);

    try {
      // Animación de salto + giros (2.5 segundos total)
      await controls.start({
        y: [-10, -80, -10], // Salto
        rotate: [0, 360, 720], // 2 vueltas completas
        scale: [1, 1.1, 1],
        transition: {
          duration: 2.5,
          times: [0, 0.5, 1],
          ease: [0.43, 0.13, 0.23, 0.96]
        }
      });
      
      console.log('[DinoMascot] Animación completada ✓');
    } catch (error) {
      console.error('[DinoMascot] Error en animación:', error);
    } finally {
      // GARANTÍA: Liberar bloqueo SIEMPRE (incluso si hay error)
      isAnimatingRef.current = false;
      setIsAnimating(false);
      console.log('[DinoMascot] Lock liberado, listo para nueva interacción');
    }
  }, [controls]); // Solo depende de controls, que es estable

  return { isAnimating, triggerAction, controls };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const DinoMascot = ({
  stage,
  size = 'md',
  className = '',
  onInteraction
}: DinoMascotProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isSleepTime } = useSleepMode();
  const { isAnimating, triggerAction, controls } = useInteractionLock();

  // Detectar prefers-reduced-motion
  const prefersReducedMotion = useMemo(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Configuración de tamaños (reducidos para no tapar texto)
  const sizeConfig = useMemo(() => ({
    sm: { width: 100, height: 120, scale: 0.65 },
    md: { width: 130, height: 155, scale: 0.85 },
    lg: { width: 160, height: 190, scale: 1.0 }
  }), []);

  const { width, height, scale } = sizeConfig[size];

  // Lazy loading con IntersectionObserver
  useIntersectionObserver(
    containerRef,
    (isIntersecting) => {
      if (isIntersecting && !isVisible) {
        setIsVisible(true);
      }
    },
    { threshold: 0.1, rootMargin: '50px' }
  );

  // Handler de click/touch unificado (NO dispara callback para evitar toasts)
  const handleInteraction = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); // Prevenir comportamiento por defecto
    e.stopPropagation(); // Evitar propagación
    
    console.log('[DinoMascot] Interacción detectada:', e.pointerType, '| Animando:', isAnimating);
    triggerAction(); // Solo dispara animación si no está bloqueado
  }, [triggerAction, isAnimating]);

  // Renderizar componente según etapa
  const renderStage = () => {
    switch (stage) {
      case 'egg':
        return (
          <EggStage
            isSleeping={isSleepTime}
            reducedMotion={prefersReducedMotion}
          />
        );
      case 'cracking':
        return (
          <CrackingStage
            isSleeping={isSleepTime}
            reducedMotion={prefersReducedMotion}
          />
        );
      case 'hatching':
        return (
          <HatchingStage
            isSleeping={isSleepTime}
            reducedMotion={prefersReducedMotion}
          />
        );
      case 'grown':
        return (
          <GrownStage
            isSleeping={isSleepTime}
            reducedMotion={prefersReducedMotion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center ${className}`}
      style={{
        minHeight: `${height}px`,
        contain: 'layout'
      }}
    >
      {isVisible && (
        <motion.div
          animate={controls}
          onPointerDown={handleInteraction} // Unifica touch y click
          style={{
            cursor: isAnimating ? 'default' : 'pointer',
            transformOrigin: 'center center',
            transform: 'translateZ(0)', // GPU acceleration
            width: `${width}px`,
            height: `${height}px`,
            position: 'relative',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation' // Previene zoom en doble tap
          }}
          whileHover={!isAnimating && !prefersReducedMotion ? { scale: 1.05 } : {}}
          // whileTap removido para evitar conflictos con animate={controls}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative'
              }}
            >
              {renderStage()}
              {isSleepTime && <SleepingZZZ />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTES POR ETAPA
// ============================================

// 1) ETAPA: HUEVO
interface StageProps {
  isSleeping: boolean;
  reducedMotion: boolean;
}

const EggStage = ({ isSleeping, reducedMotion }: StageProps) => {
  const rockAnimation = reducedMotion ? {} : {
    rotate: [-3, 3, -3],
    y: [0, -8, 0],
    transition: {
      duration: isSleeping ? 4 : 2.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  return (
    <svg viewBox="0 0 160 165" className="w-full h-full">
      <defs>
        <radialGradient id="eggGradient" cx="0.3" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="50%" stopColor="#FFE4C4" />
          <stop offset="100%" stopColor="#F5DEB3" />
        </radialGradient>
        <filter id="softShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g id="pet">
        {/* Sombra */}
        <ellipse
          cx="80"
          cy="145"
          rx="38"
          ry="7"
          fill="rgba(0,0,0,0.15)"
        />

        {/* Huevo con animación de balanceo */}
        <motion.g animate={rockAnimation}>
          <ellipse
            id="egg"
            cx="80"
            cy="80"
            rx="45"
            ry="58"
            fill="url(#eggGradient)"
            filter="url(#softShadow)"
          />

          {/* Highlight */}
          <ellipse
            cx="58"
            cy="56"
            rx="16"
            ry="22"
            fill="rgba(255,255,255,0.5)"
          />

          {/* Patrón decorativo */}
          <motion.path
            d="M 48 95 Q 80 100 112 95"
            stroke="#E8D4A0"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={reducedMotion ? {} : {
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Detalle de "sueño" en huevo */}
          {isSleeping && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <text
                x="80"
                y="85"
                textAnchor="middle"
                fontSize="20"
                fill="#C4A77D"
                opacity="0.4"
              >
                zzZ
              </text>
            </motion.g>
          )}
        </motion.g>
      </g>
    </svg>
  );
};

// 2) ETAPA: AGRIETÁNDOSE (con tapa desprendida)
const CrackingStage = ({ isSleeping, reducedMotion }: StageProps) => {
  const shakeAnimation = reducedMotion ? {} : {
    x: [-2, 2, -2, 2, 0],
    rotate: [-1, 1, -1, 1, 0],
    transition: {
      duration: isSleeping ? 3 : 0.8,
      repeat: Infinity,
      repeatDelay: isSleeping ? 2 : 1.5,
      ease: 'easeInOut'
    }
  };

  // Animación de tapa levantándose y cabeza asomándose
  const capAnimation = reducedMotion || isSleeping ? {} : {
    y: [0, -18, 0],
    rotate: [0, -12, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      repeatDelay: 2,
      ease: 'easeInOut'
    }
  };

  const peekAnimation = reducedMotion || isSleeping ? {} : {
    y: [20, 0, 20],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      repeatDelay: 2,
      ease: 'easeInOut'
    }
  };

  return (
    <svg viewBox="0 0 160 165" className="w-full h-full">
      <defs>
        <radialGradient id="eggCrackGradient" cx="0.3" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="50%" stopColor="#FFE4C4" />
          <stop offset="100%" stopColor="#F5DEB3" />
        </radialGradient>
        <radialGradient id="dinoGreen" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#8FD8B8" />
          <stop offset="100%" stopColor="#5BB98C" />
        </radialGradient>
      </defs>

      <g id="pet">
        {/* Sombra */}
        <ellipse cx="80" cy="145" rx="38" ry="7" fill="rgba(0,0,0,0.15)" />

        {/* Parte inferior del huevo (fija, con vibración) */}
        <motion.g animate={shakeAnimation}>
          {/* Base del huevo */}
          <ellipse
            cx="80"
            cy="88"
            rx="45"
            ry="50"
            fill="url(#eggCrackGradient)"
            filter="url(#softShadow)"
          />
          
          {/* Borde de apertura (donde se separó la tapa) */}
          <ellipse
            cx="80"
            cy="48"
            rx="44"
            ry="8"
            fill="#E8D4A0"
            opacity="0.8"
          />

          {/* Grietas verticales */}
          <path
            d="M 50 55 L 48 75 L 52 90"
            stroke="#8B7355"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 110 58 L 112 78 L 108 95"
            stroke="#8B7355"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Glow en grietas */}
          <motion.path
            d="M 50 55 L 48 75 L 52 90"
            stroke="#5BB98C"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
            animate={reducedMotion ? {} : {
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.g>

        {/* Tapa superior del huevo (se levanta) */}
        {!isSleeping && (
          <motion.g
            animate={capAnimation}
            style={{ transformOrigin: '80px 48px' }}
          >
            {/* Tapa desprendida */}
            <path
              d="M 36 48 Q 36 30 80 22 Q 124 30 124 48 Q 120 52 80 55 Q 40 52 36 48 Z"
              fill="url(#eggCrackGradient)"
              filter="url(#softShadow)"
            />
            {/* Borde interior de tapa */}
            <ellipse
              cx="80"
              cy="48"
              rx="42"
              ry="6"
              fill="#D4C4A0"
              opacity="0.6"
            />
          </motion.g>
        )}

        {/* Dino asomándose (peek animation) */}
        {!isSleeping && (
          <motion.g
            animate={peekAnimation}
            style={{ transformOrigin: '80px 60px' }}
          >
            {/* Cabeza del dino (más kawaii) */}
            <ellipse
              cx="80"
              cy="55"
              rx="24"
              ry="22"
              fill="url(#dinoGreen)"
            />

            {/* Cachetes kawaii */}
            <ellipse cx="62" cy="58" rx="6" ry="5" fill="#FFB6C1" opacity="0.6" />
            <ellipse cx="98" cy="58" rx="6" ry="5" fill="#FFB6C1" opacity="0.6" />

            {/* Ojos grandes kawaii */}
            <circle cx="70" cy="52" r="5" fill="#2C3E50" />
            <circle cx="90" cy="52" r="5" fill="#2C3E50" />
            <circle cx="71" cy="51" r="2" fill="white" />
            <circle cx="91" cy="51" r="2" fill="white" />

            {/* Sonrisa adorable */}
            <path
              d="M 68 62 Q 80 66 92 62"
              stroke="#2C3E50"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Cuernitos pequeños */}
            <circle cx="65" cy="40" r="4" fill="#5BB98C" />
            <circle cx="95" cy="40" r="4" fill="#5BB98C" />
          </motion.g>
        )}
      </g>
    </svg>
  );
};

// 3) ETAPA: NACIENDO (diseño kawaii mejorado)
const HatchingStage = ({ isSleeping, reducedMotion }: StageProps) => {
  const bodyBounce = reducedMotion ? {} : {
    y: [0, -6, 0],
    transition: {
      duration: isSleeping ? 3 : 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const tailWag = reducedMotion ? {} : {
    rotate: [-20, 20, -20],
    transition: {
      duration: isSleeping ? 2.8 : 1.6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const headTilt = reducedMotion ? {} : {
    rotate: [-8, 8, -8],
    transition: {
      duration: isSleeping ? 3.2 : 2.3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  return (
    <svg viewBox="0 0 160 165" className="w-full h-full">
      <defs>
        <radialGradient id="dinoBodyGrad" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#8FD8B8" />
          <stop offset="100%" stopColor="#5BB98C" />
        </radialGradient>
        <radialGradient id="dinoHeadGrad" cx="0.25" cy="0.25" r="0.75">
          <stop offset="0%" stopColor="#A8E6CF" />
          <stop offset="100%" stopColor="#6BC9A0" />
        </radialGradient>
      </defs>

      <g id="pet">
        {/* Sombra */}
        <ellipse cx="80" cy="145" rx="42" ry="7" fill="rgba(0,0,0,0.18)" />

        {/* Cáscaras rotas en el suelo */}
        <g id="brokenShells" opacity="0.7">
          <ellipse cx="45" cy="135" rx="16" ry="10" fill="#F5DEB3" />
          <ellipse cx="115" cy="138" rx="14" ry="9" fill="#F5DEB3" />
          <ellipse cx="78" cy="142" rx="10" ry="7" fill="#E8D4A0" />
        </g>

        <motion.g animate={bodyBounce}>
          {/* Cola con movimiento independiente (más larga y con espinas) */}
          <motion.g
            animate={tailWag}
            style={{ transformOrigin: '48px 110px' }}
          >
            <path
              id="tail"
              d="M 48 110 Q 28 105 18 92"
              stroke="url(#dinoBodyGrad)"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
            />
            {/* Espinas en cola */}
            <circle cx="38" cy="102" r="4" fill="#6BC9A0" />
            <circle cx="28" cy="98" r="4" fill="#6BC9A0" />
            <circle cx="18" cy="92" r="5" fill="#5BB98C" />
          </motion.g>

          {/* Cuerpo principal */}
          <ellipse
            id="body"
            cx="80"
            cy="108"
            rx="32"
            ry="35"
            fill="url(#dinoBodyGrad)"
          />

          {/* Barriga más clara */}
          <ellipse
            cx="85"
            cy="115"
            rx="18"
            ry="22"
            fill="#C8F0DE"
            opacity="0.6"
          />

          {/* Patas delanteras */}
          <ellipse cx="65" cy="135" rx="9" ry="13" fill="#4AAB7E" />
          <ellipse cx="95" cy="135" rx="9" ry="13" fill="#4AAB7E" />
          
          {/* Patas traseras (más atrás) */}
          <ellipse cx="58" cy="130" rx="8" ry="11" fill="#3D9168" opacity="0.8" />
          <ellipse cx="102" cy="130" rx="8" ry="11" fill="#3D9168" opacity="0.8" />

          {/* Espinas/cresta en espalda */}
          <motion.g
            animate={reducedMotion ? {} : {
              scale: [1, 1.08, 1],
              transition: { duration: 2.5, repeat: Infinity }
            }}
          >
            <circle cx="60" cy="88" r="5" fill="#6BC9A0" />
            <circle cx="70" cy="84" r="6" fill="#6BC9A0" />
            <circle cx="80" cy="82" r="6" fill="#6BC9A0" />
            <circle cx="90" cy="84" r="6" fill="#6BC9A0" />
            <circle cx="100" cy="88" r="5" fill="#6BC9A0" />
          </motion.g>

          {/* Cabeza con inclinación independiente (más kawaii) */}
          <motion.g
            animate={headTilt}
            style={{ transformOrigin: '100px 70px' }}
          >
            <ellipse
              id="head"
              cx="100"
              cy="70"
              rx="26"
              ry="24"
              fill="url(#dinoHeadGrad)"
            />

            {/* Hocico pequeño */}
            <ellipse cx="118" cy="72" rx="10" ry="8" fill="#7FD4AC" />

            {/* Cachetes kawaii */}
            <ellipse cx="82" cy="75" rx="6" ry="5" fill="#FFB6C1" opacity="0.7" />
            <ellipse cx="118" cy="75" rx="6" ry="5" fill="#FFB6C1" opacity="0.7" />

            {/* Ojos (cerrados si duerme) */}
            {isSleeping ? (
              <>
                <path d="M 86 65 Q 92 68 98 65" stroke="#2C3E50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 102 65 Q 108 68 114 65" stroke="#2C3E50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="92" cy="65" r="6" fill="#2C3E50" />
                <circle cx="108" cy="65" r="6" fill="#2C3E50" />
                <circle cx="93" cy="64" r="2.5" fill="white" />
                <circle cx="109" cy="64" r="2.5" fill="white" />
              </>
            )}

            {/* Sonrisa adorable */}
            <path
              d="M 88 80 Q 100 84 112 80"
              stroke="#2C3E50"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Cuernitos */}
            <circle cx="84" cy="52" r="5" fill="#5BB98C" />
            <circle cx="116" cy="52" r="5" fill="#5BB98C" />
            
            {/* Fosas nasales */}
            <circle cx="122" cy="70" r="1.5" fill="#4AAB7E" />
            <circle cx="122" cy="75" r="1.5" fill="#4AAB7E" />
          </motion.g>

          {/* Brazos */}
          <ellipse cx="52" cy="105" rx="7" ry="13" fill="#4AAB7E" />
          <ellipse cx="108" cy="105" rx="7" ry="13" fill="#4AAB7E" />
        </motion.g>
      </g>
    </svg>
  );
};

// 4) ETAPA: COMPLETAMENTE CRECIDO (más compacto, no tapa texto)
const GrownStage = ({ isSleeping, reducedMotion }: StageProps) => {
  // "Baile" - movimientos independientes y coordinados
  const bodyDance = reducedMotion ? {} : {
    y: [0, -8, 0, -4, 0],
    rotate: [0, -2, 2, 0],
    transition: {
      duration: isSleeping ? 4 : 2.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const tailDance = reducedMotion ? {} : {
    rotate: [-20, 20, -10, 10, -20],
    transition: {
      duration: isSleeping ? 3.5 : 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  const headBop = reducedMotion ? {} : {
    y: [0, -6, 0, -3, 0],
    rotate: [0, -3, 3, -2, 0],
    transition: {
      duration: isSleeping ? 3 : 2.3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  return (
    <svg viewBox="0 0 160 165" className="w-full h-full">
      <defs>
        <radialGradient id="grownBodyGrad" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#7FD4AC" />
          <stop offset="100%" stopColor="#4AAB7E" />
        </radialGradient>
        <radialGradient id="grownHeadGrad" cx="0.25" cy="0.25" r="0.75">
          <stop offset="0%" stopColor="#9DE8C0" />
          <stop offset="100%" stopColor="#5BB98C" />
        </radialGradient>
      </defs>

      <g id="pet">
        {/* Sombra */}
        <ellipse cx="80" cy="145" rx="48" ry="8" fill="rgba(0,0,0,0.2)" />

        <motion.g animate={bodyDance}>
          {/* Cola con baile independiente (más larga y con espinas) */}
          <motion.g
            animate={tailDance}
            style={{ transformOrigin: '40px 115px' }}
          >
            <path
              id="tail"
              d="M 40 115 Q 18 105 8 82"
              stroke="url(#grownBodyGrad)"
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
            />
            {/* Espinas en cola */}
            <circle cx="30" cy="102" r="5" fill="#6BC9A0" />
            <circle cx="20" cy="93" r="5" fill="#6BC9A0" />
            <circle cx="12" cy="85" r="6" fill="#5BB98C" />
            <circle cx="8" cy="82" r="5" fill="#4AAB7E" />
          </motion.g>

          {/* Cuerpo (más compacto) */}
          <ellipse
            id="body"
            cx="80"
            cy="110"
            rx="38"
            ry="42"
            fill="url(#grownBodyGrad)"
          />

          {/* Barriga más clara */}
          <ellipse
            cx="85"
            cy="118"
            rx="22"
            ry="28"
            fill="#C8F0DE"
            opacity="0.6"
          />

          {/* Patas */}
          <g id="legs">
            <ellipse cx="62" cy="138" rx="10" ry="14" fill="#4AAB7E" />
            <ellipse cx="98" cy="138" rx="10" ry="14" fill="#4AAB7E" />
            {/* Patas traseras (atrás) */}
            <ellipse cx="56" cy="133" rx="9" ry="12" fill="#3D9168" opacity="0.7" />
            <ellipse cx="104" cy="133" rx="9" ry="12" fill="#3D9168" opacity="0.7" />
          </g>

          {/* Cresta/púas en espalda (más visibles) */}
          <motion.g
            animate={reducedMotion ? {} : {
              scale: [1, 1.12, 1],
              transition: { duration: 2.2, repeat: Infinity }
            }}
          >
            <circle cx="58" cy="78" r="6" fill="#6BC9A0" />
            <circle cx="68" cy="72" r="7" fill="#6BC9A0" />
            <circle cx="80" cy="68" r="8" fill="#5BB98C" />
            <circle cx="92" cy="72" r="7" fill="#6BC9A0" />
            <circle cx="102" cy="78" r="6" fill="#6BC9A0" />
          </motion.g>

          {/* Cabeza con bop independiente (más grande y expresiva) */}
          <motion.g
            animate={headBop}
            style={{ transformOrigin: '105px 68px' }}
          >
            <ellipse
              id="head"
              cx="105"
              cy="68"
              rx="30"
              ry="28"
              fill="url(#grownHeadGrad)"
            />

            {/* Hocico/snout */}
            <ellipse cx="126" cy="70" rx="11" ry="9" fill="#7FD4AC" />

            {/* Cachetes kawaii */}
            <ellipse cx="84" cy="73" rx="7" ry="6" fill="#FFB6C1" opacity="0.7" />
            <ellipse cx="126" cy="73" rx="7" ry="6" fill="#FFB6C1" opacity="0.7" />

            {/* Ojos (cerrados si duerme) */}
            {isSleeping ? (
              <>
                <path d="M 90 61 Q 97 64 104 61" stroke="#2C3E50" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 110 61 Q 117 64 124 61" stroke="#2C3E50" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="97" cy="61" r="7" fill="#2C3E50" />
                <circle cx="117" cy="61" r="7" fill="#2C3E50" />
                <circle cx="98" cy="60" r="3" fill="white" />
                <circle cx="118" cy="60" r="3" fill="white" />
              </>
            )}

            {/* Sonrisa grande */}
            <path
              d="M 92 80 Q 105 85 118 80"
              stroke="#2C3E50"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Cuernitos más grandes */}
            <circle cx="86" cy="46" r="6" fill="#5BB98C" />
            <circle cx="124" cy="46" r="6" fill="#5BB98C" />

            {/* Fosas nasales */}
            <circle cx="131" cy="68" r="2" fill="#4AAB7E" />
            <circle cx="131" cy="73" r="2" fill="#4AAB7E" />
          </motion.g>

          {/* Brazos */}
          <ellipse cx="48" cy="105" rx="8" ry="15" fill="#4AAB7E" />
          <ellipse cx="112" cy="105" rx="8" ry="15" fill="#4AAB7E" />
        </motion.g>
      </g>
    </svg>
  );
};

// ============================================
// COMPONENTE: ZZZ de sueño
// ============================================

const SleepingZZZ = () => {
  return (
    <motion.g
      id="zzz"
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [10, -30, -30, -40],
        x: [0, 5, 5, 10]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeOut'
      }}
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transformOrigin: 'center'
      }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60">
        <text x="5" y="25" fontSize="18" fill="#7B68EE" opacity="0.8">Z</text>
        <text x="20" y="20" fontSize="14" fill="#9370DB" opacity="0.7">Z</text>
        <text x="32" y="15" fontSize="10" fill="#BA55D3" opacity="0.6">z</text>
      </svg>
    </motion.g>
  );
};

export default DinoMascot;
