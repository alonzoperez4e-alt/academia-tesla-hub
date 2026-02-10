import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

// Lazy-load Lottie solo cuando sea necesario (code-splitting)
const Lottie = lazy(() => import('lottie-react').then(module => ({ default: module.default })));

interface StudentCharacter3DOptimizedProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showProgressText?: boolean;
  className?: string;
  reducedMotion?: boolean; // Override automático de prefers-reduced-motion
}

type DinoStage = 'egg' | 'cracking' | 'hatching' | 'grown';

const StudentCharacter3DOptimized = ({
  progress,
  size = 'md',
  showProgressText = true,
  className = '',
  reducedMotion
}: StudentCharacter3DOptimizedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationData, setAnimationData] = useState<Record<DinoStage, any>>({} as any);
  const [loadError, setLoadError] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Detectar prefers-reduced-motion
  const prefersReducedMotion = useMemo(() => {
    if (reducedMotion !== undefined) return reducedMotion;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [reducedMotion]);

  // Determinar etapa basada en progreso
  // 0-24% = egg, 25-49% = cracking, 50-74% = hatching, 75-100% = grown
  const stage: DinoStage = useMemo(() => {
    if (progress < 25) return 'egg';
    if (progress < 50) return 'cracking';
    if (progress < 75) return 'hatching';
    return 'grown';
  }, [progress]);

  // Configuración de tamaños
  const sizeConfig = useMemo(() => ({
    sm: { width: 100, height: 120, containerClass: 'w-[100px] h-[120px]' },
    md: { width: 140, height: 170, containerClass: 'w-[140px] h-[170px]' },
    lg: { width: 180, height: 220, containerClass: 'w-[180px] h-[220px]' }
  }), []);

  const { width, height, containerClass } = sizeConfig[size];

  // IntersectionObserver para lazy-loading
  useIntersectionObserver(containerRef, (isIntersecting) => {
    if (isIntersecting && !isVisible) {
      setIsVisible(true);
    }
  }, { threshold: 0.1, rootMargin: '50px' });

  // Cargar assets de Lottie solo cuando el componente sea visible
  useEffect(() => {
    if (!isVisible || assetsLoaded) return;

    const loadAnimations = async () => {
      try {
        // Cargar solo el asset actual y el siguiente (pre-caching inteligente)
        const stagesToLoad = [stage];
        const nextStage = getNextStage(stage);
        if (nextStage) stagesToLoad.push(nextStage);

        const loadPromises = stagesToLoad.map(async (stageKey) => {
          // Importación dinámica con Vite
          // En producción, estos archivos deben existir en /public/assets/dino/
          const assetPath = `/assets/dino/${stageKey}.json`;
          
          try {
            const response = await fetch(assetPath);
            if (!response.ok) throw new Error(`Failed to load ${assetPath}`);
            const data = await response.json();
            return { stage: stageKey, data };
          } catch (error) {
            console.warn(`Could not load animation for ${stageKey}:`, error);
            return { stage: stageKey, data: null };
          }
        });

        const results = await Promise.all(loadPromises);
        const newAnimationData: Partial<Record<DinoStage, any>> = {};
        
        results.forEach(({ stage: stageKey, data }) => {
          if (data) newAnimationData[stageKey] = data;
        });

        setAnimationData(prev => ({ ...prev, ...newAnimationData }));
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Error loading Lottie animations:', error);
        setLoadError(true);
      }
    };

    loadAnimations();
  }, [isVisible, stage, assetsLoaded]);

  // Helper para obtener siguiente etapa (pre-caching)
  function getNextStage(currentStage: DinoStage): DinoStage | null {
    const stages: DinoStage[] = ['egg', 'cracking', 'hatching', 'grown'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  }

  // Mensajes motivacionales
  const getMotivationalMessage = () => {
    switch (stage) {
      case 'egg': return '¡Tu aventura de aprendizaje está comenzando!';
      case 'cracking': return '¡Excelente! Tu conocimiento está creciendo';
      case 'hatching': return '¡Increíble! Tu personaje está naciendo';
      case 'grown': return '¡Felicitaciones! Eres un estudiante experto';
      default: return '';
    }
  };

  // Opciones de Lottie optimizadas para rendimiento
  const lottieOptions = useMemo(() => ({
    loop: !prefersReducedMotion, // No loop si usuario prefiere reducir movimiento
    autoplay: !prefersReducedMotion,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
      clearCanvas: true,
      progressiveLoad: true, // Carga progresiva
      hideOnTransparent: true,
      className: 'dino-animation'
    }
  }), [prefersReducedMotion]);

  // Animaciones de contenedor (solo transform y opacity - 60fps)
  const containerAnimation = prefersReducedMotion ? {} : {
    y: [0, -6, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
      repeatType: 'loop' as const
    }
  };

  // Fallback visual si no carga Lottie o hay error
  const renderFallback = () => (
    <div 
      className={`${containerClass} flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 rounded-full relative overflow-hidden`}
      style={{ 
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.08)',
        aspectRatio: `${width}/${height}`
      }}
    >
      {/* Fallback minimalista con CSS puro */}
      <div className="relative w-16 h-20">
        {stage === 'egg' && (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 rounded-[50%] shadow-lg" />
        )}
        {stage === 'cracking' && (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 rounded-[50%] shadow-lg relative">
            <div className="absolute inset-0 bg-amber-900/20" style={{ 
              clipPath: 'polygon(48% 20%, 52% 20%, 60% 50%, 56% 50%, 65% 80%, 61% 80%)'
            }} />
          </div>
        )}
        {(stage === 'hatching' || stage === 'grown') && (
          <div className="w-12 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full relative">
            <div className="absolute top-2 left-2 w-2 h-2 bg-slate-800 rounded-full" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-slate-800 rounded-full" />
          </div>
        )}
      </div>
      
      {/* Indicador de carga/error */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500">
        {loadError ? '⚠️' : '⏳'}
      </div>
    </div>
  );

  // Renderizar Lottie o fallback
  const renderAnimation = () => {
    const currentAnimationData = animationData[stage];

    // Si no hay data para la etapa actual, mostrar fallback
    if (!currentAnimationData && !loadError) {
      return renderFallback();
    }

    if (loadError) {
      return renderFallback();
    }

    return (
      <Suspense fallback={renderFallback()}>
        <div 
          className={`${containerClass} relative`}
          style={{ 
            width: `${width}px`, 
            height: `${height}px`,
            willChange: prefersReducedMotion ? 'auto' : 'transform',
            contain: 'layout paint' // Optimización de renderizado
          }}
        >
          <Lottie
            animationData={currentAnimationData}
            loop={lottieOptions.loop}
            autoplay={lottieOptions.autoplay}
            rendererSettings={lottieOptions.rendererSettings}
            style={{
              width: '100%',
              height: '100%',
              transform: 'translateZ(0)', // Activar GPU acceleration
            }}
          />
        </div>
      </Suspense>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center ${className}`}
      style={{
        minHeight: `${height + 60}px`, // Evitar CLS (Cumulative Layout Shift)
        contain: 'layout' // Aislamiento de layout
      }}
    >
      {/* Contenedor de animación con floating effect */}
      <motion.div
        animate={containerAnimation}
        style={{
          transformOrigin: 'center center',
          // Solo GPU-accelerated properties
          transform: 'translateZ(0)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.2 : 0.6, 
              ease: 'backOut' 
            }}
          >
            {isVisible ? renderAnimation() : renderFallback()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Texto de progreso y motivación */}
      {showProgressText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: prefersReducedMotion ? 0 : 0.3, 
            duration: 0.5 
          }}
          className="text-center mt-3 px-4"
          style={{
            transform: 'translateZ(0)' // GPU acceleration
          }}
        >
          <div className="text-sm font-bold text-primary mb-1">
            {Math.round(progress)}% Completado
          </div>
          <div className="text-xs text-muted-foreground max-w-[200px]">
            {getMotivationalMessage()}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentCharacter3DOptimized;
