/**
 * EJEMPLO DE INTEGRACIÓN - StudentCharacter3DOptimized
 * 
 * Este archivo muestra cómo integrar el dinosaurio optimizado
 * en diferentes partes de tu aplicación.
 */

import { useState } from 'react';
import StudentCharacter3DOptimized from '@/components/student/StudentCharacter3DOptimized';

// ============================================
// EJEMPLO 1: Uso básico (Reemplazo directo)
// ============================================

export function BasicExample() {
  const [userProgress] = useState(45); // 0-100

  return (
    <div className="flex justify-center p-8">
      <StudentCharacter3DOptimized
        progress={userProgress}
        size="md"
        showProgressText={true}
      />
    </div>
  );
}

// ============================================
// EJEMPLO 2: Con control de progreso interactivo
// ============================================

export function InteractiveExample() {
  const [progress, setProgress] = useState(0);

  const stages = [
    { name: 'Huevo', value: 10 },
    { name: 'Agrietándose', value: 35 },
    { name: 'Naciendo', value: 60 },
    { name: 'Crecido', value: 90 }
  ];

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <StudentCharacter3DOptimized
        progress={progress}
        size="lg"
        showProgressText={true}
      />
      
      {/* Controles para testing */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium">Progreso: {progress}%</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="flex-1"
          />
        </label>
        
        {/* Botones rápidos por etapa */}
        <div className="flex gap-2">
          {stages.map((stage) => (
            <button
              key={stage.name}
              onClick={() => setProgress(stage.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-teal-100 hover:bg-teal-200 transition-colors"
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 3: En un dashboard real
// ============================================

export function DashboardExample() {
  // Simulación de datos del estudiante
  const studentData = {
    name: 'Ana Martínez',
    completedLessons: 12,
    totalLessons: 20,
    streak: 5
  };

  // Calcular progreso basado en lecciones completadas
  const progress = Math.round((studentData.completedLessons / studentData.totalLessons) * 100);

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6">
      {/* Columna izquierda: Dinosaurio */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8">
        <StudentCharacter3DOptimized
          progress={progress}
          size="lg"
          showProgressText={true}
          className="mb-4"
        />
        
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            ¡Sigue así, {studentData.name}!
          </h3>
          <p className="text-sm text-gray-600">
            {studentData.completedLessons} de {studentData.totalLessons} lecciones completadas
          </p>
        </div>
      </div>

      {/* Columna derecha: Estadísticas */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold mb-2">Progreso General</h4>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-teal-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% completado</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold mb-2">Racha Actual</h4>
          <p className="text-3xl font-bold text-orange-500">{studentData.streak} días 🔥</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 4: Múltiples tamaños lado a lado
// ============================================

export function SizeComparisonExample() {
  const [progress] = useState(75);

  return (
    <div className="flex items-end justify-center gap-8 p-8 bg-gray-50">
      <div className="text-center">
        <StudentCharacter3DOptimized
          progress={progress}
          size="sm"
          showProgressText={false}
        />
        <p className="text-xs text-gray-500 mt-2">Small</p>
      </div>

      <div className="text-center">
        <StudentCharacter3DOptimized
          progress={progress}
          size="md"
          showProgressText={true}
        />
        <p className="text-xs text-gray-500 mt-2">Medium (default)</p>
      </div>

      <div className="text-center">
        <StudentCharacter3DOptimized
          progress={progress}
          size="lg"
          showProgressText={true}
        />
        <p className="text-xs text-gray-500 mt-2">Large</p>
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 5: Con modo de movimiento reducido
// ============================================

export function AccessibilityExample() {
  const [progress] = useState(60);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <StudentCharacter3DOptimized
        progress={progress}
        size="md"
        showProgressText={true}
        reducedMotion={reducedMotion}
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={reducedMotion}
          onChange={(e) => setReducedMotion(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm">
          Activar modo de movimiento reducido
        </span>
      </label>

      <p className="text-xs text-gray-500 max-w-md text-center">
        El componente detecta automáticamente la preferencia del sistema
        (prefers-reduced-motion), pero puedes forzarla manualmente.
      </p>
    </div>
  );
}

// ============================================
// EJEMPLO 6: Integración en StudentDashboard
// ============================================

/**
 * Para integrar en StudentDashboard.tsx, simplemente reemplaza:
 * 
 * ANTES:
 * import StudentCharacter3D from "@/components/student/StudentCharacter3D";
 * 
 * DESPUÉS:
 * import StudentCharacter3D from "@/components/student/StudentCharacter3DOptimized";
 * 
 * El resto del código queda exactamente igual porque las props son compatibles.
 * 
 * Ubicación en StudentDashboard.tsx (aproximadamente línea 100-150):
 * 
 * <StudentCharacter3D
 *   progress={calculateUserProgress()}  // Tu lógica de cálculo existente
 *   size="md"
 *   showProgressText={true}
 * />
 * 
 * No necesitas cambiar nada más. ✅
 */

// ============================================
// EJEMPLO 7: Con animación de progreso gradual
// ============================================

export function ProgressAnimationExample() {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateProgress = () => {
    setIsAnimating(true);
    setProgress(0);
    
    let current = 0;
    const target = 85;
    const increment = 1;
    const delay = 50; // ms

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
        setIsAnimating(false);
      }
      setProgress(current);
    }, delay);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <StudentCharacter3DOptimized
        progress={progress}
        size="lg"
        showProgressText={true}
      />

      <button
        onClick={animateProgress}
        disabled={isAnimating}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isAnimating ? 'Animando...' : 'Animar Progreso'}
      </button>

      <p className="text-xs text-gray-500 max-w-md text-center">
        Las transiciones entre etapas son automáticas y suaves.
        El componente maneja el cambio de assets de manera fluida.
      </p>
    </div>
  );
}

// ============================================
// EXPORTAR TODOS LOS EJEMPLOS
// ============================================

export default function DinoExamplesShowcase() {
  return (
    <div className="space-y-12 p-8 bg-gray-100">
      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplo 1: Uso Básico</h2>
        <BasicExample />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplo 2: Interactivo</h2>
        <InteractiveExample />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplo 3: Dashboard</h2>
        <DashboardExample />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplo 4: Tamaños</h2>
        <SizeComparisonExample />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplo 5: Accesibilidad</h2>
        <AccessibilityExample />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplo 7: Animación de Progreso</h2>
        <ProgressAnimationExample />
      </div>
    </div>
  );
}
