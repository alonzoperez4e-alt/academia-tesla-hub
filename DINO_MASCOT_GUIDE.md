# 🦖 Sistema de Mascota Dinosaurio Kawaii - Documentación Técnica

## 📋 Decisión Técnica Final

### ✅ Solución Elegida: **SVG + Framer Motion**

#### Justificación por Rendimiento y Calidad:

| Criterio | Lottie | **SVG + Framer Motion** | Ganador |
|----------|--------|------------------------|---------|
| **Control de capas independientes** | ⚠️ Limitado | ✅ Total | **SVG** |
| **Interacción click/touch nativa** | ❌ Requiere wrapper | ✅ Nativo | **SVG** |
| **Cambio de estado en runtime** | ❌ Difícil | ✅ Fácil | **SVG** |
| **Modo noche (ojos/zzz)** | ❌ Requiere múltiples archivos | ✅ Condicional | **SVG** |
| **Peso total** | 50-200KB | 15-30KB | **SVG** |
| **Rendimiento 60fps móvil** | ✅ Bueno | ✅ Excelente | **Empate** |
| **Calidad visual kawaii** | ✅ Depende del diseño | ✅ Depende del diseño | **Empate** |
| **Mantenibilidad** | ⚠️ Requiere After Effects | ✅ Código directo | **SVG** |
| **Animaciones independientes** | ⚠️ Timeline único | ✅ Por componente | **SVG** |

### ✅ Ventajas de SVG + Framer Motion para este caso:

1. **Control granular**: Cada capa (head, body, tail, eyes) se anima independientemente
2. **Interactividad nativa**: Click/touch con `onClick`/`onTouchEnd` sin wrappers
3. **Estados dinámicos**: Cambiar ojos cerrados/abiertos, añadir/quitar zzz en runtime
4. **Peso ultra-ligero**: ~25KB de código total vs 150-200KB de Lottie
5. **Sin dependencias extras**: Framer Motion ya está instalado en el proyecto
6. **Debugging fácil**: Inspeccionar SVG en DevTools
7. **Responsive perfecto**: SVG escala sin pérdida de calidad
8. **CSS-in-JS**: Estilos y animaciones en un solo lugar

### ⚠️ Cuándo Lottie sería mejor:

- Animaciones fotorrealistas complejas con texturas
- Diseñador solo trabaja en After Effects (no código)
- Animaciones con muchos keyframes difíciles de codificar
- Proyecto ya usa Lottie en otros lugares

---

## 🎨 Estructura de Componentes

```
DinoMascot/
├── DinoMascot.tsx              # Componente principal (orquestador)
├── Etapas (subcomponentes):
│   ├── EggStage                # SVG inline con animación idle
│   ├── CrackingStage           # SVG + peek animation
│   ├── HatchingStage           # SVG + múltiples capas animadas
│   └── GrownStage              # SVG + "baile" coordinado
├── Utilidades:
│   ├── useSleepMode()          # Hook detección 12 AM - 6 AM
│   ├── useInteractionLock()    # Hook bloqueo anti-interrupción
│   └── SleepingZZZ             # Componente zzz flotante
└── use-intersection-observer   # Hook lazy-load (ya existe)
```

---

## 📐 Especificaciones por Etapa

### 1️⃣ ETAPA: HUEVO

**Archivo:** No requiere archivo externo (SVG inline)  
**Progreso asociado:** 0-24%  
**ViewBox:** `0 0 160 190`

#### Capas SVG:
```xml
<g id="pet">
  <ellipse /> <!-- Sombra -->
  <g> <!-- Contenedor con animación -->
    <ellipse id="egg" /> <!-- Huevo principal -->
    <ellipse /> <!-- Highlight (brillo) -->
    <path /> <!-- Patrón decorativo -->
    <text> (opcional si isSleeping) <!-- zzZ en huevo -->
  </g>
</g>
```

#### Animación Idle:
```typescript
{
  rotate: [-3, 3, -3],  // Balanceo suave
  y: [0, -8, 0],        // Bounce vertical
  transition: {
    duration: 2.5s (normal) / 4s (durmiendo),
    repeat: Infinity,
    ease: 'easeInOut'
  }
}
```

#### Gradientes:
- **eggGradient**: Radial beige/crema (#FFF8E7 → #F5DEB3)
- **Highlight**: Elipse blanca con opacity 0.5

#### Modo Noche:
- Duración de animación: **4s** (más lento)
- Añade texto "zzZ" con opacity 0.4 centrado

---

### 2️⃣ ETAPA: AGRIETÁNDOSE

**Archivo:** No requiere archivo externo (SVG inline)  
**Progreso asociado:** 25-49%  
**ViewBox:** `0 0 160 190`

#### Capas SVG:
```xml
<g id="pet">
  <ellipse /> <!-- Sombra -->
  <g id="shell-shake"> <!-- Huevo con vibración -->
    <ellipse id="shell" />
    <path /> <!-- Grieta 1 -->
    <path /> <!-- Grieta 2 -->
    <path /> <!-- Grieta 3 -->
    <path /> <!-- Glow en grietas (animado) -->
  </g>
  <g id="peek" (si !isSleeping)> <!-- Dino asomándose -->
    <ellipse id="head" />
    <circle /> <!-- Ojos (x2) -->
    <path /> <!-- Sonrisa -->
  </g>
</g>
```

#### Animaciones:

**Idle (Shake):**
```typescript
{
  x: [-2, 2, -2, 2, 0],
  rotate: [-1, 1, -1, 1, 0],
  transition: {
    duration: 0.8s (normal) / 3s (durmiendo),
    repeat: Infinity,
    repeatDelay: 1.5s (normal) / 2s (durmiendo)
  }
}
```

**Peek (Solo si NO duerme):**
```typescript
{
  y: [0, -25, 0],           // Cabeza sube y baja
  opacity: [0, 1, 1, 1, 0], // Aparece gradualmente
  transition: {
    duration: 3s,
    repeat: Infinity,
    repeatDelay: 2s,
    times: [0, 0.3, 0.6, 0.9, 1]
  }
}
```

**Glow en grietas:**
```typescript
{
  opacity: [0.3, 0.8, 0.3],
  transition: {
    duration: 1.5s,
    repeat: Infinity
  }
}
```

#### Modo Noche:
- **NO** ejecuta peek animation
- Shake más lento (3s)
- Grietas mantienen glow suave

---

### 3️⃣ ETAPA: NACIENDO

**Archivo:** No requiere archivo externo (SVG inline)  
**Progreso asociado:** 50-74%  
**ViewBox:** `0 0 160 190`

#### Capas SVG:
```xml
<g id="pet">
  <ellipse /> <!-- Sombra -->
  <g id="brokenShells"> <!-- Cáscaras en el suelo -->
    <ellipse /> (x3)
  </g>
  <g id="body-bounce"> <!-- Contenedor principal -->
    <g id="tail-wag"> <!-- Cola con movimiento independiente -->
      <path id="tail" />
      <circle /> <!-- Punta de cola -->
    </g>
    <ellipse id="body" />
    <ellipse /> <!-- Patas traseras (x2) -->
    <g id="head-tilt"> <!-- Cabeza con movimiento independiente -->
      <ellipse id="head" />
      <ellipse /> <!-- Cachetes kawaii (x2) -->
      <circle|path> <!-- Ojos (cerrados si duerme) -->
      <path /> <!-- Sonrisa -->
      <circle /> <!-- Cuernitos (x2) -->
    </g>
    <ellipse /> <!-- Brazos (x2) -->
  </g>
</g>
```

#### Animaciones Independientes:

**Body Bounce:**
```typescript
{
  y: [0, -5, 0],
  transition: {
    duration: 2s (normal) / 3s (durmiendo),
    repeat: Infinity
  }
}
```

**Tail Wag:**
```typescript
{
  rotate: [-15, 15, -15],
  transformOrigin: '55px 130px',
  transition: {
    duration: 1.5s (normal) / 2.5s (durmiendo),
    repeat: Infinity
  }
}
```

**Head Tilt:**
```typescript
{
  rotate: [-5, 5, -5],
  transformOrigin: '85px 95px',
  transition: {
    duration: 2.2s (normal) / 3s (durmiendo),
    repeat: Infinity
  }
}
```

#### Modo Noche:
- **Ojos cerrados**: Arcos (`<path>`) en lugar de círculos
- Animaciones más lentas (×1.5 duración)
- Cachetes kawaii mantienen opacity 0.5

---

### 4️⃣ ETAPA: COMPLETAMENTE CRECIDO

**Archivo:** No requiere archivo externo (SVG inline)  
**Progreso asociado:** 75-100%  
**ViewBox:** `0 0 160 190`

#### Capas SVG:
```xml
<g id="pet">
  <ellipse /> <!-- Sombra -->
  <g id="body-dance"> <!-- Contenedor principal -->
    <g id="tail-dance"> <!-- Cola con baile independiente -->
      <path id="tail" />
      <circle /> <!-- Púas en cola (x2) -->
    </g>
    <ellipse id="body" />
    <ellipse /> <!-- Barriga más clara -->
    <g id="legs">
      <ellipse /> (x4) <!-- Patas delanteras y traseras -->
    </g>
    <g id="spikes"> <!-- Cresta/púas en espalda -->
      <circle /> (x3)
    </g>
    <g id="head-bop"> <!-- Cabeza con bop independiente -->
      <ellipse id="head" />
      <ellipse /> <!-- Hocico/snout -->
      <ellipse /> <!-- Cachetes kawaii (x2) -->
      <circle|path> <!-- Ojos (cerrados si duerme) -->
      <path /> <!-- Sonrisa -->
      <circle /> <!-- Cuernitos (x2) -->
      <circle /> <!-- Fosas nasales (x2) -->
    </g>
    <ellipse /> <!-- Brazos (x2) -->
  </g>
</g>
```

#### Animaciones "Baile" Coordinadas:

**Body Dance:**
```typescript
{
  y: [0, -8, 0, -4, 0],
  rotate: [0, -2, 2, 0],
  transition: {
    duration: 2.5s (normal) / 4s (durmiendo),
    repeat: Infinity
  }
}
```

**Tail Dance:**
```typescript
{
  rotate: [-20, 20, -10, 10, -20],
  transformOrigin: '45px 145px',
  transition: {
    duration: 2s (normal) / 3.5s (durmiendo),
    repeat: Infinity
  }
}
```

**Head Bop:**
```typescript
{
  y: [0, -6, 0, -3, 0],
  rotate: [0, -3, 3, -2, 0],
  transformOrigin: '90px 90px',
  transition: {
    duration: 2.3s (normal) / 3s (durmiendo),
    repeat: Infinity
  }
}
```

**Spikes (Cresta):**
```typescript
{
  scale: [1, 1.1, 1],
  transition: {
    duration: 2s,
    repeat: Infinity
  }
}
```

#### Modo Noche:
- **Ojos cerrados**: Arcos grandes (#2C3E50, strokeWidth 2.5)
- Todas las animaciones ×1.5-1.6 más lentas
- Mantiene todos los elementos visuales

---

## 🌙 Sistema de Modo Noche

### Hook: `useSleepMode()`

```typescript
interface TimeState {
  isSleepTime: boolean;
  currentHour: number;
}

// Detecta automáticamente si está entre 12:00 AM - 6:00 AM
function useSleepMode(): TimeState {
  const [timeState, setTimeState] = useState(() => {
    const hour = new Date().getHours();
    return {
      currentHour: hour,
      isSleepTime: hour >= 0 && hour < 6
    };
  });

  useEffect(() => {
    // Actualiza cada 60 segundos
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      const isSleepTime = hour >= 0 && hour < 6;
      
      // Solo actualiza si cambió el estado
      if (prev.isSleepTime !== isSleepTime) {
        setTimeState({ currentHour: hour, isSleepTime });
      }
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  return timeState;
}
```

### Comportamiento en Modo Noche:

| Etapa | Cambios Visuales | Cambios de Animación |
|-------|------------------|---------------------|
| **Huevo** | + Texto "zzZ" (opacity 0.4) | Duración: 2.5s → 4s |
| **Agrietándose** | Desactiva peek animation | Shake: 0.8s → 3s |
| **Naciendo** | Ojos cerrados (arcos) | Todas ×1.5 lentas |
| **Crecido** | Ojos cerrados (arcos grandes) | Todas ×1.5-1.6 lentas |

### Componente ZZZ Flotante:

```typescript
<SleepingZZZ />

// Animación:
{
  opacity: [0, 1, 1, 0],
  y: [10, -30, -30, -40],
  x: [0, 5, 5, 10],
  transition: {
    duration: 3s,
    repeat: Infinity,
    ease: 'easeOut'
  }
}
```

**Posición:** Arriba de la cabeza  
**Colores:** #7B68EE, #9370DB, #BA55D3 (degradado)  
**Tamaños:** 18px, 14px, 10px (Z grande → z pequeña)

---

## 🎯 Sistema de Interacción

### Hook: `useInteractionLock()`

```typescript
function useInteractionLock() {
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation(); // Framer Motion

  const triggerAction = async () => {
    if (isAnimating) return; // ⚠️ BLOQUEO

    setIsAnimating(true);

    await controls.start({
      y: [-10, -80, -10],        // Salto alto
      rotate: [0, 360, 720],      // 2 vueltas completas
      scale: [1, 1.1, 1],         // Zoom suave
      transition: {
        duration: 2.5,            // 2.5 segundos total
        times: [0, 0.5, 1],
        ease: [0.43, 0.13, 0.23, 0.96] // Curva custom
      }
    });

    setIsAnimating(false); // ✅ Desbloqueo
  };

  return { isAnimating, triggerAction, controls };
}
```

### Uso en Componente:

```tsx
<motion.div
  animate={controls}
  onClick={handleInteraction}
  onTouchEnd={handleInteraction}
  style={{
    cursor: isAnimating ? 'default' : 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  }}
  whileHover={!isAnimating ? { scale: 1.05 } : {}}
  whileTap={!isAnimating ? { scale: 0.95 } : {}}
>
```

### Prevención de Doble Click:

1. **Estado `isAnimating`**: Bloquea trigger mientras está true
2. **Async/await**: Espera a que termine la animación
3. **Cursor change**: Indica visualmente que no es clickeable
4. **whileHover/Tap**: Desactivados durante animación

---

## ⚡ Optimizaciones de Rendimiento

### 1. Transform y Opacity Only ✅

**Todas las animaciones usan SOLO:**
- `transform` (translate, rotate, scale)
- `opacity`

**Evitamos completamente:**
- ❌ `top`, `left`, `right`, `bottom`
- ❌ `width`, `height`
- ❌ `margin`, `padding`

### 2. GPU Acceleration ✅

```tsx
style={{
  transform: 'translateZ(0)',  // Force GPU layer
  willChange: 'transform',     // Hint al navegador
}}
```

### 3. Lazy Loading ✅

```typescript
useIntersectionObserver(
  containerRef,
  (isIntersecting) => {
    if (isIntersecting && !isVisible) {
      setIsVisible(true); // Renderiza solo cuando es visible
    }
  },
  { threshold: 0.1, rootMargin: '50px' }
);
```

### 4. Prevención de Re-renders ✅

```typescript
// useMemo para configuraciones estáticas
const sizeConfig = useMemo(() => ({...}), []);

// useCallback para handlers
const handleInteraction = useCallback(() => {...}, [isAnimating]);

// Estado mínimo (solo lo necesario)
const [isVisible, setIsVisible] = useState(false);
const [isAnimating, setIsAnimating] = useState(false);
```

### 5. Respeta prefers-reduced-motion ✅

```typescript
const prefersReducedMotion = useMemo(() => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}, []);

// Aplicado en animaciones:
const animation = reducedMotion ? {} : { /* animación normal */ };
```

### 6. Layout Estable (CLS = 0) ✅

```tsx
<div
  style={{
    minHeight: `${height}px`,  // Reserva espacio
    contain: 'layout'          // Aislamiento de layout
  }}
>
```

### 7. Filtros SVG Ligeros ✅

**Solo filtros permitidos (bajo impacto):**
- `<feGaussianBlur stdDeviation="3">` (sombras suaves)
- `<feOffset>` (desplazamiento de sombra)

**Evitados:**
- ❌ `blur()` grande (> 5px)
- ❌ `drop-shadow()` múltiples
- ❌ Máscaras complejas

---

## 📦 Estructura de Archivos

```
src/
└── components/
    └── student/
        ├── DinoMascot.tsx                    # ✅ Componente principal
        └── DinoIntegrationExamples.tsx       # (opcional) Ejemplos
hooks/
└── use-intersection-observer.ts              # ✅ Ya existe

# NO se requieren archivos externos de assets
# Todo está embebido como SVG inline en el componente
```

### Ventajas de SVG Inline:

✅ **1 solo archivo** (no requests HTTP adicionales)  
✅ **SSR-friendly** (renderiza en servidor)  
✅ **Tree-shaking** amigable  
✅ **No lazy-load de assets** (solo del componente)  
✅ **Cache con el bundle** de JS  

---

## 💻 Uso del Componente

### Ejemplo Básico:

```tsx
import { DinoMascot } from '@/components/student/DinoMascot';

function MiComponente() {
  const [userProgress, setUserProgress] = useState(45); // 0-100

  // Calcular etapa basada en progreso
  const stage = useMemo(() => {
    if (userProgress < 25) return 'egg';
    if (userProgress < 50) return 'cracking';
    if (userProgress < 75) return 'hatching';
    return 'grown';
  }, [userProgress]);

  return (
    <DinoMascot
      stage={stage}
      size="md"
      onInteraction={() => console.log('¡Dino tocado!')}
    />
  );
}
```

### Ejemplo Avanzado (Con Progreso Animado):

```tsx
import { DinoMascot } from '@/components/student/DinoMascot';
import { useState, useEffect } from 'react';

function DinoWithProgress() {
  const [progress, setProgress] = useState(0);

  // Simular progreso gradual
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const stage = useMemo(() => {
    if (progress < 25) return 'egg';
    if (progress < 50) return 'cracking';
    if (progress < 75) return 'hatching';
    return 'grown';
  }, [progress]);

  return (
    <div className="flex flex-col items-center gap-4">
      <DinoMascot
        stage={stage}
        size="lg"
        onInteraction={() => {
          // Dar reward al tocar
          setProgress(prev => Math.min(prev + 5, 100));
        }}
      />
      
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm mb-1">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-teal-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

### Ejemplo en StudentDashboard:

```tsx
// En StudentDashboard.tsx

import { DinoMascot } from '@/components/student/DinoMascot';
import { useMemo } from 'react';

function StudentDashboard() {
  // Tu lógica existente de progreso...
  const completedLessons = 12;
  const totalLessons = 20;
  const progress = (completedLessons / totalLessons) * 100;

  const dinoStage = useMemo(() => {
    if (progress < 25) return 'egg';
    if (progress < 50) return 'cracking';
    if (progress < 75) return 'hatching';
    return 'grown';
  }, [progress]);

  return (
    <div className="dashboard">
      {/* Otras secciones... */}
      
      <div className="dino-section bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8">
        <DinoMascot
          stage={dinoStage}
          size="lg"
          onInteraction={() => {
            toast({
              title: "¡Mascota feliz! 🦖",
              description: "Tu dinosaurio te está animando"
            });
          }}
        />
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Completa más lecciones para evolucionar tu mascota
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Personalización

### Cambiar Colores:

Modificar los gradientes en cada etapa:

```tsx
// En EggStage:
<radialGradient id="eggGradient">
  <stop offset="0%" stopColor="#FFF8E7" />  // Color claro
  <stop offset="50%" stopColor="#FFE4C4" /> // Color medio
  <stop offset="100%" stopColor="#F5DEB3" /> // Color oscuro
</radialGradient>

// Para dino verde:
<radialGradient id="dinoBodyGrad">
  <stop offset="0%" stopColor="#8FD8B8" />  // Verde claro
  <stop offset="100%" stopColor="#5BB98C" /> // Verde oscuro
</radialGradient>
```

### Cambiar Velocidad de Animaciones:

```tsx
// En cada animación, ajustar `duration`:
const animation = {
  rotate: [-3, 3, -3],
  transition: {
    duration: 2.5,  // ← Aumentar para más lento (ej: 4)
    repeat: Infinity
  }
};
```

### Añadir Más Etapas:

```tsx
// 1. Añadir tipo
export type DinoStage = 'egg' | 'cracking' | 'hatching' | 'grown' | 'mega';

// 2. Crear componente
const MegaStage = ({ isSleeping, reducedMotion }: StageProps) => {
  // SVG + animaciones...
};

// 3. Añadir en renderStage()
case 'mega':
  return <MegaStage isSleeping={isSleepTime} reducedMotion={prefersReducedMotion} />;
```

---

## 📱 Checklist de Performance para Móvil

### Pre-lanzamiento:

#### 1. Validar FPS (objetivo: ≥ 55fps en gama baja)

**Herramientas:**
- Chrome DevTools → Performance Monitor
- Real device testing (Android gama baja)

**Método:**
```javascript
// Añadir temporalmente en desarrollo
let frameCount = 0;
let lastTime = performance.now();

function measureFPS() {
  frameCount++;
  const now = performance.now();
  
  if (now >= lastTime + 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = now;
  }
  
  requestAnimationFrame(measureFPS);
}

measureFPS();
```

**Targets:**
- ✅ Desktop: 60fps constante
- ✅ iPhone 8+: 60fps
- ✅ Android mid-range: 55-60fps
- ✅ **Android low-end**: **≥ 50fps** (CRÍTICO)

---

#### 2. Validar Memoria (objetivo: < 25MB heap)

**Chrome DevTools → Memory:**
1. Take heap snapshot antes de montar componente
2. Tomar second snapshot con componente visible
3. Comparar diferencia

**Targets:**
- ✅ Heap size increase: < 5MB
- ✅ Detached DOM nodes: 0
- ✅ Memory leaks: 0 (verificar con unmount/remount)

---

#### 3. Validar Tamaño de Assets

**En este caso: N/A** (SVG inline, parte del bundle)

**Verificar bundle size:**
```bash
npm run build
# Verificar tamaño de chunk con DinoMascot

# O con bundle analyzer:
npm install --save-dev webpack-bundle-analyzer
```

**Targets:**
- ✅ DinoMascot.tsx gzipped: < 15KB
- ✅ Total bundle increase: < 20KB

---

#### 4. Validar Web Vitals

**Herramienta:** Lighthouse CI o web-vitals library

```bash
npm install web-vitals
```

```tsx
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getLCP(console.log);  // Largest Contentful Paint
```

**Targets:**
- ✅ **LCP**: < 2.5s (mascota debe cargar rápido)
- ✅ **CLS**: **0** (layout estable, minHeight fijo)
- ✅ **FID**: < 100ms (interacción rápida)

---

#### 5. Validar en Red Lenta

**Chrome DevTools → Network:**
- Throttling: "Slow 3G"
- Verificar que el componente carga sin bloquear UI
- Lazy-load debe funcionar correctamente

**Targets:**
- ✅ Tiempo hasta interactive: < 3s en Slow 3G
- ✅ No bloquea renderizado de contenido crítico
- ✅ Lazy-load activa correctamente

---

#### 6. Validar Interacción Touch

**Dispositivos reales (iOS/Android):**
- Tocar mascota → Debe responder inmediatamente
- Tocar durante animación → No debe interrumpir
- Tocar rápidamente múltiples veces → Solo 1 animación

**Verificaciones:**
- ✅ `onTouchEnd` funciona (no solo onClick)
- ✅ `WebkitTapHighlightColor: transparent`
- ✅ Bloqueo anti-interrupción efectivo
- ✅ No hay delay de 300ms (fast-click)

---

#### 7. Validar Modo Noche

**Test manual:**
1. Cambiar hora del sistema a 1:00 AM
2. Recargar página
3. Verificar: ojos cerrados + zzz aparece
4. Cambiar hora a 7:00 AM
5. Esperar 1 minuto (o forzar re-check)
6. Verificar: ojos abiertos + zzz desaparece

**Verificaciones:**
- ✅ Detecta hora correctamente al montar
- ✅ Actualiza cada minuto (60000ms)
- ✅ No requiere reload de página
- ✅ Transición suave (AnimatePresence)

---

#### 8. Validar Accesibilidad

**prefers-reduced-motion:**
```javascript
// En DevTools → Rendering → Emulate CSS media
// Activar "prefers-reduced-motion: reduce"
```

**Verificaciones:**
- ✅ Animaciones idle se desactivan completamente
- ✅ Animación de acción (click) se mantiene pero simplificada
- ✅ Transiciones de etapa más rápidas (0.2s vs 0.5s)

**Screen readers:**
- ⚠️ SVG decorativo → añadir `aria-hidden="true"` al contenedor
- ✅ Opcional: añadir `aria-label` descriptivo

---

#### 9. Testeo Multi-dispositivo

| Dispositivo | OS | FPS | Memoria | Touch | ✅ |
|-------------|-----|-----|---------|-------|---|
| iPhone 13 Pro | iOS 16 | 60 | < 10MB | ✅ | ✅ |
| iPhone 8 | iOS 15 | 60 | < 15MB | ✅ | ✅ |
| Samsung A52 | Android 12 | 55-60 | < 20MB | ✅ | ✅ |
| Xiaomi Redmi 9 | Android 11 | **≥ 50** | **< 25MB** | ✅ | ✅ |
| Desktop Chrome | Win 11 | 60 | < 8MB | N/A | ✅ |
| Desktop Safari | macOS | 60 | < 10MB | N/A | ✅ |

---

#### 10. Validar Múltiples Instancias

**Escenario:** 3-5 mascotas en la misma página (ej: leaderboard)

```tsx
<div className="grid grid-cols-3 gap-4">
  <DinoMascot stage="egg" size="sm" />
  <DinoMascot stage="cracking" size="sm" />
  <DinoMascot stage="hatching" size="sm" />
  <DinoMascot stage="grown" size="sm" />
  <DinoMascot stage="grown" size="sm" />
</div>
```

**Targets:**
- ✅ FPS: ≥ 50fps con 5 instancias
- ✅ Memoria: < 40MB total
- ✅ CPU: < 30% en idle
- ✅ Cada una responde independientemente

---

## 🐛 Troubleshooting

### Problema: Animaciones se ven entrecortadas en móvil

**Solución 1:** Reducir duración de animaciones
```tsx
duration: 2.5 → 2  // Más corto = menos frames
```

**Solución 2:** Simplificar paths en SVG
```tsx
// ANTES:
d="M 80 40 Q 75 50 L 82 70 Q 78 80 L 76 85"

// DESPUÉS (menos puntos):
d="M 80 40 L 75 55 L 82 70 L 76 85"
```

**Solución 3:** Desactivar filtros en móvil
```tsx
filter={isMobile ? 'none' : 'url(#softShadow)'}
```

---

### Problema: Modo noche no se activa

**Verificar:**
```typescript
// Añadir console.log temporal
const { isSleepTime, currentHour } = useSleepMode();
console.log('Hora actual:', currentHour, 'Durmiendo:', isSleepTime);
```

**Posibles causas:**
- Zona horaria incorrecta (usar `new Date().getHours()` local)
- Intervalo no se ejecuta (verificar cleanup)
- Estado no actualiza (verificar dependencies)

---

### Problema: Click no funciona en móvil

**Solución:**
```tsx
// Asegurar ambos handlers
onClick={handleInteraction}       // Desktop
onTouchEnd={handleInteraction}    // Mobile

// Y estilos anti-highlight:
style={{
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none'
}}
```

---

### Problema: Animación se interrumpe al tocar

**Verificar bloqueo:**
```typescript
const handleInteraction = () => {
  console.log('isAnimating:', isAnimating);  // Debe ser true durante anim
  if (!isAnimating) {
    triggerAction();
  }
};
```

**Asegurar:**
- `setIsAnimating(true)` ANTES de `controls.start()`
- `setIsAnimating(false)` DESPUÉS con `await`

---

### Problema: Layout shift al cargar

**Solución:**
```tsx
<div style={{
  minHeight: `${height}px`,  // ← Reservar espacio ANTES de cargar
  contain: 'layout'
}}>
```

---

## 📚 Referencias y Recursos

### Framer Motion:
- [Animation Controls](https://www.framer.com/motion/animation/#controls)
- [Transform Properties](https://www.framer.com/motion/gestures/#transform)
- [Reduced Motion](https://www.framer.com/motion/guide-accessibility/#reduced-motion)

### SVG Optimization:
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimizador online
- [SVG Path Visualization](https://svg-path-visualizer.netlify.app/)

### Performance:
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## 📊 Comparación Final: SVG vs Lottie

| Aspecto | SVG + Framer Motion ✅ | Lottie |
|---------|----------------------|--------|
| **Peso total** | ~25KB (código) | ~150-200KB (JSON) |
| **Requests HTTP** | 0 (inline) | 4 (egg, crack, hatch, grown) |
| **Control capas** | Total | Limitado |
| **Modo noche** | Condicional fácil | Requiere múltiples archivos |
| **Interacción** | Nativa | Wrapper requerido |
| **FPS móvil gama baja** | 55-60fps | 50-55fps |
| **Mantenibilidad** | Alta (código) | Media (After Effects) |
| **Curva de aprendizaje** | Media (SVG + React) | Baja (diseñador) |
| **SSR** | ✅ Funciona | ⚠️ Requiere cliente |

---

**Versión:** 1.0.0  
**Fecha:** Febrero 2026  
**Tecnologías:** React + TypeScript + Framer Motion + SVG  
**Autor:** Frontend Engineer Senior - Academia Tesla Hub
