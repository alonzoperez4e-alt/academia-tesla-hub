/**
 * 🦖 EJEMPLOS DE INTEGRACIÓN - DinoMascot
 * 
 * Casos de uso reales para implementar la mascota dinosaurio
 * en diferentes partes de la aplicación.
 */

import { DinoMascot } from '@/components/student/DinoMascot';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

// ============================================
// EJEMPLO 1: Dashboard Principal con Progreso
// ============================================

export function DinoInDashboard() {
  // Simulación de datos del estudiante
  const studentData = {
    completedLessons: 15,
    totalLessons: 20,
    streak: 7,
    points: 850
  };

  // Calcular progreso global
  const progress = (studentData.completedLessons / studentData.totalLessons) * 100;

  // Determinar etapa del dino
  const dinoStage = useMemo(() => {
    if (progress < 25) return 'egg';
    if (progress < 50) return 'cracking';
    if (progress < 75) return 'hatching';
    return 'grown';
  }, [progress]);

  // Mensaje según etapa
  const getMessage = () => {
    switch (dinoStage) {
      case 'egg':
        return '¡Tu aventura está comenzando! Completa más lecciones';
      case 'cracking':
        return '¡Tu huevo está agrietándose! ¡Sigue así!';
      case 'hatching':
        return '¡Tu dinosaurio está naciendo! ¡Increíble progreso!';
      case 'grown':
        return '¡Tu dinosaurio ha crecido completamente! ¡Eres increíble!';
      default:
        return '';
    }
  };

  return (
    <div className="grid md:grid-cols-12 gap-6 p-6">
      {/* Contenido principal */}
      <div className="md:col-span-8 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard del Estudiante</h1>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">Lecciones</p>
            <p className="text-2xl font-bold">{studentData.completedLessons}/{studentData.totalLessons}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">Racha 🔥</p>
            <p className="text-2xl font-bold">{studentData.streak} días</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">Puntos ⭐</p>
            <p className="text-2xl font-bold">{studentData.points}</p>
          </div>
        </div>

        {/* Otras secciones... */}
      </div>

      {/* Sidebar con mascota */}
      <div className="md:col-span-4">
        <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg sticky top-4">
          <h3 className="text-lg font-bold text-center mb-4 text-gray-800">
            Tu Mascota 🦖
          </h3>

          {/* Mascota */}
          <DinoMascot
            stage={dinoStage}
            size="lg"
            onInteraction={() => {
              toast({
                title: '¡Dino feliz! 🎉',
                description: '+10 puntos de felicidad',
                duration: 2000
              });
            }}
          />

          {/* Mensaje motivacional */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-700 font-medium">
              {getMessage()}
            </p>
          </motion.div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Próximo milestone */}
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <p className="text-xs text-gray-600">
              {progress < 25 && '🥚 Siguiente: Huevo agrietándose (25%)'}
              {progress >= 25 && progress < 50 && '🐣 Siguiente: Nacimiento (50%)'}
              {progress >= 50 && progress < 75 && '🦖 Siguiente: Completamente crecido (75%)'}
              {progress >= 75 && '🏆 ¡Máximo nivel alcanzado!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 2: Sistema de Progreso Animado
// ============================================

export function DinoProgressAnimation() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const dinoStage = useMemo(() => {
    if (progress < 25) return 'egg';
    if (progress < 50) return 'cracking';
    if (progress < 75) return 'hatching';
    return 'grown';
  }, [progress]);

  // Animar progreso gradualmente
  const animateProgress = () => {
    setIsPlaying(true);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 50); // 5 segundos total
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-8">
        Evolución del Dinosaurio
      </h2>

      {/* Mascota */}
      <div className="flex justify-center mb-8">
        <DinoMascot
          stage={dinoStage}
          size="lg"
          onInteraction={() => {
            toast({
              title: '¡Dino te saluda! 👋',
              description: 'Sigue completando lecciones para evolucionar'
            });
          }}
        />
      </div>

      {/* Indicadores de etapas */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {['Huevo', 'Agrietándose', 'Naciendo', 'Crecido'].map((label, i) => {
          const isActive =
            (i === 0 && progress >= 0) ||
            (i === 1 && progress >= 25) ||
            (i === 2 && progress >= 50) ||
            (i === 3 && progress >= 75);

          return (
            <div
              key={label}
              className={`text-center p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-teal-100 text-teal-700 font-bold'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <p className="text-xs">{label}</p>
              <p className="text-lg font-bold">{i * 25}%</p>
            </div>
          );
        })}
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progreso de evolución</span>
          <span className="font-bold text-teal-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-3">
        <button
          onClick={animateProgress}
          disabled={isPlaying}
          className="flex-1 py-3 px-6 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPlaying ? 'Evolucionando...' : 'Iniciar Evolución'}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          disabled={isPlaying}
          className="flex-1"
        />
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 3: Leaderboard con Múltiples Dinos
// ============================================

export function DinoLeaderboard() {
  const students = [
    { name: 'Ana Martínez', progress: 95, rank: 1 },
    { name: 'Carlos López', progress: 78, rank: 2 },
    { name: 'María García', progress: 62, rank: 3 },
    { name: 'Juan Pérez', progress: 45, rank: 4 },
    { name: 'Sofía Rodríguez', progress: 28, rank: 5 }
  ];

  const getStage = (progress: number) => {
    if (progress < 25) return 'egg';
    if (progress < 50) return 'cracking';
    if (progress < 75) return 'hatching';
    return 'grown';
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        🏆 Clasificación de Estudiantes
      </h2>

      <div className="space-y-4">
        {students.map((student, index) => (
          <motion.div
            key={student.name}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-6">
              {/* Ranking */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {student.rank}
                </span>
              </div>

              {/* Mascota */}
              <div className="flex-shrink-0">
                <DinoMascot
                  stage={getStage(student.progress)}
                  size="sm"
                  onInteraction={() => {
                    toast({
                      title: `Mascota de ${student.name}`,
                      description: `${student.progress}% de progreso`
                    });
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{student.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {student.progress}%
                  </span>
                </div>
              </div>

              {/* Etapa */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-500">Etapa</p>
                <p className="font-semibold text-teal-600">
                  {getStage(student.progress) === 'egg' && '🥚 Huevo'}
                  {getStage(student.progress) === 'cracking' && '🔨 Agrietándose'}
                  {getStage(student.progress) === 'hatching' && '🐣 Naciendo'}
                  {getStage(student.progress) === 'grown' && '🦖 Crecido'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 4: Comparación de Etapas
// ============================================

export function DinoStagesShowcase() {
  const stages = [
    {
      id: 'egg',
      name: 'Huevo',
      progress: '0-24%',
      description: 'El comienzo de tu aventura. ¡Sigue estudiando!',
      icon: '🥚'
    },
    {
      id: 'cracking',
      name: 'Agrietándose',
      progress: '25-49%',
      description: 'Tu esfuerzo está dando frutos. ¡El dino quiere salir!',
      icon: '🔨'
    },
    {
      id: 'hatching',
      name: 'Naciendo',
      progress: '50-74%',
      description: '¡Increíble! Tu dinosaurio está naciendo.',
      icon: '🐣'
    },
    {
      id: 'grown',
      name: 'Completamente Crecido',
      progress: '75-100%',
      description: '¡Lo lograste! Tu dinosaurio está completamente desarrollado.',
      icon: '🦖'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-12">
        Etapas de Evolución de la Mascota
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stages.map((stage) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="flex justify-center mb-4">
              <DinoMascot
                stage={stage.id as any}
                size="md"
              />
            </div>

            <h3 className="text-xl font-bold mb-2">
              {stage.icon} {stage.name}
            </h3>

            <p className="text-sm text-teal-600 font-semibold mb-3">
              {stage.progress}
            </p>

            <p className="text-sm text-gray-600">
              {stage.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 5: Modo Noche Demo
// ============================================

export function DinoNightModeDemo() {
  const [currentHour, setCurrentHour] = useState(14); // 2 PM por defecto

  const isSleepTime = currentHour >= 0 && currentHour < 6;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-bold text-center mb-8">
        Modo Noche Automático (12 AM - 6 AM)
      </h2>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Control de hora simulada */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3">
            Simular Hora del Día: {currentHour}:00 {currentHour < 12 ? 'AM' : 'PM'}
          </label>
          <input
            type="range"
            min="0"
            max="23"
            value={currentHour}
            onChange={(e) => setCurrentHour(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* Indicador de modo */}
        <div
          className={`p-4 rounded-lg mb-6 text-center font-semibold ${
            isSleepTime
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isSleepTime ? '😴 Modo Noche Activo' : '☀️ Modo Día Activo'}
        </div>

        {/* Dinosaurio */}
        <div className="flex justify-center">
          <DinoMascot
            stage="grown"
            size="lg"
          />
        </div>

        {/* Explicación */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-bold mb-2">Comportamiento:</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              {isSleepTime ? '✅' : '⏸️'} Ojos cerrados (modo sueño)
            </li>
            <li>
              {isSleepTime ? '✅' : '⏸️'} Zzz flotando sobre la cabeza
            </li>
            <li>
              {isSleepTime ? '✅' : '⏸️'} Animaciones más lentas
            </li>
            <li>
              {!isSleepTime ? '✅' : '⏸️'} Ojos abiertos (modo activo)
            </li>
            <li>
              {!isSleepTime ? '✅' : '⏸️'} Animaciones normales
            </li>
          </ul>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          💡 En producción, el modo se detecta automáticamente cada minuto sin recargar
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHOWCASE COMPLETO
// ============================================

export default function DinoMascotShowcase() {
  const [activeExample, setActiveExample] = useState(0);

  const examples = [
    { name: 'Dashboard', component: DinoInDashboard },
    { name: 'Progreso Animado', component: DinoProgressAnimation },
    { name: 'Leaderboard', component: DinoLeaderboard },
    { name: 'Comparación Etapas', component: DinoStagesShowcase },
    { name: 'Modo Noche', component: DinoNightModeDemo }
  ];

  const ActiveComponent = examples[activeExample].component;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">
          🦖 Ejemplos de Integración - DinoMascot
        </h1>

        {/* Navegación */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {examples.map((example, index) => (
            <button
              key={example.name}
              onClick={() => setActiveExample(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeExample === index
                  ? 'bg-teal-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>

        {/* Ejemplo activo */}
        <motion.div
          key={activeExample}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ActiveComponent />
        </motion.div>
      </div>
    </div>
  );
}
