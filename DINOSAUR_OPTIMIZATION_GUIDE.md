# 🦖 Sistema de Dinosaurio Optimizado - Documentación Técnica

## 📋 Resumen

Sistema de visualización de dinosaurio con **4 etapas evolutivas** basado en progreso del estudiante, optimizado para **rendimiento en móviles de gama baja** (60fps garantizado).

**Tecnología elegida:** Lottie (animaciones vectoriales JSON)

**Ventajas vs GIF/Spritesheet:**
- ✅ **10-20x más ligero** que GIF
- ✅ **Escalable sin pérdida** de calidad (vectorial)
- ✅ **Menor consumo de CPU/GPU** que spritesheets
- ✅ **Control programático** total del playback
- ✅ **Compatible con prefers-reduced-motion**

---

## 🗂️ Estructura de Archivos

```
public/
└── assets/
    └── dino/
        ├── egg.json          # Etapa 1: Huevo (0-24% progreso)
        ├── cracking.json     # Etapa 2: Agrietándose (25-49%)
        ├── hatching.json     # Etapa 3: Naciendo (50-74%)
        └── grown.json        # Etapa 4: Completamente crecido (75-100%)
```

---

## 🎨 Especificaciones Técnicas de Assets

### General (aplica a todas las etapas)

| Propiedad | Valor | Justificación |
|-----------|-------|---------------|
| **Formato** | Lottie JSON | Vectorial, ligero, programable |
| **Peso máximo** | **50KB por archivo** | Carga rápida en 3G (< 200ms) |
| **Dimensiones base** | 300x360px @ 72dpi | Escala perfecta a sm/md/lg |
| **FPS** | **24-30fps** | Balance calidad/rendimiento móvil |
| **Duración loop** | 3-6 segundos | Natural, no repetitivo |
| **Compresión** | bodymovin con optimización | Reducir puntos de curva |

---

## 🥚 Etapa 1: Huevo (`egg.json`)

**Progreso:** 0-24%  
**Mensaje:** "¡Tu aventura de aprendizaje está comenzando!"

### Características visuales
- Huevo ovalado con textura suave (gradiente beige/crema)
- Iluminación superior izquierda (highlight)
- Sombra ovalada debajo
- **Animación:** Leve balanceo (±2°) + breathing (scale 1.0 → 1.03)

### Especificaciones
```json
{
  "duracion": "4s",
  "loop": true,
  "peso_maximo": "30KB",
  "colores": ["#FFFBF0", "#F8F0E3", "#F0E6D3", "#E8DCC6"],
  "movimiento": "Balanceo sutil, breathing scale"
}
```

---

## 🔨 Etapa 2: Agrietándose (`cracking.json`)

**Progreso:** 25-49%  
**Mensaje:** "¡Excelente! Tu conocimiento está creciendo"

### Características visuales
- Huevo con grietas progresivas (marrón oscuro #8B4513)
- Luz tenue filtrándose por las grietas (glow teal/verde)
- **Vibración** del huevo para dar sensación de movimiento interno
- Partículas muy sutiles de polvo/fragmentos

### Especificaciones
```json
{
  "duracion": "3-5s",
  "loop": true,
  "peso_maximo": "45KB",
  "grietas": "3-5 líneas con path animation",
  "efectos": "Inner glow, vibración (shake)",
  "vibration_frequency": "2 Hz suave"
}
```

---

## 🐣 Etapa 3: Naciendo (`hatching.json`)

**Progreso:** 50-74%  
**Mensaje:** "¡Increíble! Tu personaje está naciendo"

### Características visuales
- Cáscara rota en la parte superior
- Cabeza de dinosaurio bebé asomando (teal/verde #20B2AA)
- Ojos grandes y brillantes (expresión curiosa)
- Fragmentos de cáscara en el suelo
- **Animación:** Parpadeo, movimiento de cabeza (mirar alrededor)

### Especificaciones
```json
{
  "duracion": "5-6s",
  "loop": true,
  "peso_maximo": "50KB",
  "elementos": {
    "cascara_superior": "Fragmentos separados",
    "dino_bebe": "Cuerpo visible desde pecho",
    "ojos": "Parpadeo cada 3-4s",
    "movimiento": "Head turn ±15°"
  },
  "colores_dino": ["#20B2AA", "#1A9A94", "#2C3E50"]
}
```

---

## 🦖 Etapa 4: Completamente Crecido (`grown.json`)

**Progreso:** 75-100%  
**Mensaje:** "¡Felicitaciones! Eres un estudiante experto"

### Características visuales
- Dinosaurio completo de pie (estilo T-Rex amigable)
- Colores vibrantes: verde oliva (#6B8E23), verde bosque (#556B2F)
- Expresión feliz y confiada
- **Animación:** Respiración, parpadeo, cola moviéndose, pequeños saltos de celebración
- Partículas doradas/estrellas sutiles alrededor (opcional)

### Especificaciones
```json
{
  "duracion": "6s",
  "loop": true,
  "peso_maximo": "50KB",
  "animaciones": {
    "respiracion": "Chest breathing cycle 3s",
    "parpadeo": "Blink cada 4s",
    "cola": "Tail swing ±10°",
    "celebracion": "Pequeño salto ocasional"
  },
  "particulas": "Máximo 5 estrellas, fade in/out",
  "colores": ["#9ACD32", "#6B8E23", "#556B2F", "#F0E68C"]
}
```

---

## 🎬 Proceso de Exportación (After Effects → Lottie)

### Herramientas necesarias
1. **Adobe After Effects** (2020 o superior)
2. **Plugin Bodymovin** (última versión)
   - Descarga: [airbnb.io/lottie](https://airbnb.io/lottie/)

### Pasos de exportación

#### 1. Diseño en After Effects
```
- Comp Size: 300x360px, 24fps
- Duración: 72-180 frames (3-6s a 24fps)
- Usar solo: shapes, solids, masks, paths
- EVITAR: imágenes embebidas, efectos no soportados
```

#### 2. Optimización pre-exportación
- Reducir puntos de curva (Path → Simplify)
- Fusionar shapes similares cuando sea posible
- Usar expresiones simples (evitar scripts complejos)
- Limitar máscaras a 3-4 por elemento

#### 3. Configuración Bodymovin
```json
{
  "bundler": "lottie",
  "export_modes": ["demo", "json"],
  "glyphs": false,
  "hidden": false,
  "images": false,  // ⚠️ NO incluir imágenes
  "compress": true,
  "skip_images": true,
  "pretty_json": false  // Minificar
}
```

#### 4. Post-exportación (optimización manual)
```bash
# Instalar optimizador de Lottie
npm install -g @lottiefiles/lottie-optimizer

# Optimizar archivo
lottie-optimize egg.json egg-optimized.json --config high

# Validar peso
ls -lh *.json
# Objetivo: < 50KB cada uno
```

---

## 💻 Implementación en Código

### Instalación de dependencias

```bash
# Instalar lottie-react
npm install lottie-react

# Si Framer Motion no está instalado
npm install framer-motion
```

### Uso del componente

```tsx
import StudentCharacter3DOptimized from '@/components/student/StudentCharacter3DOptimized';

function MiComponente() {
  const [progress, setProgress] = useState(45); // 0-100

  return (
    <StudentCharacter3DOptimized
      progress={progress}
      size="md"                    // 'sm' | 'md' | 'lg'
      showProgressText={true}
      className="my-custom-class"
      reducedMotion={false}        // Opcional: override prefers-reduced-motion
    />
  );
}
```

### Props disponibles

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `progress` | `number` | **requerido** | 0-100, determina etapa automáticamente |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `showProgressText` | `boolean` | `true` | Mostrar porcentaje y mensaje |
| `className` | `string` | `''` | Clases CSS adicionales |
| `reducedMotion` | `boolean?` | `undefined` | Forzar modo sin animaciones |

---

## ⚡ Optimizaciones Implementadas

### 1. Lazy Loading
- ✅ `IntersectionObserver` con threshold 0.1
- ✅ `rootMargin: '50px'` (pre-carga antes de ser visible)
- ✅ Assets solo se cargan cuando el componente está en viewport

### 2. Code Splitting
- ✅ Lottie cargado con `lazy()` de React
- ✅ Reducción del bundle inicial (~30KB menos)

### 3. Pre-caching Inteligente
- ✅ Etapa actual + siguiente se cargan juntas
- ✅ Transiciones instantáneas sin loading

### 4. GPU Acceleration
- ✅ Solo animaciones con `transform` y `opacity`
- ✅ `will-change` aplicado estratégicamente
- ✅ `transform: translateZ(0)` para layer promotion

### 5. Prevención de Layout Shift
- ✅ `minHeight` fijo en contenedor
- ✅ `contain: layout` para aislamiento
- ✅ Dimensiones explícitas (no auto)

### 6. Accesibilidad
- ✅ Respeta `prefers-reduced-motion`
- ✅ Fallback visual si Lottie falla
- ✅ Mensajes descriptivos para lectores de pantalla

---

## 📱 Rendimiento en Dispositivos

### Benchmarks objetivo

| Dispositivo | FPS | Memoria | CPU |
|-------------|-----|---------|-----|
| iPhone 13+ | 60 | < 10MB | < 5% |
| iPhone 8 | 60 | < 15MB | < 10% |
| Android high-end | 60 | < 12MB | < 8% |
| Android low-end | **45-60** | < 20MB | < 15% | ← **Objetivo crítico**

### Métricas clave
- **LCP (Largest Contentful Paint):** < 1.5s
- **CLS (Cumulative Layout Shift):** 0 (sin saltos)
- **FPS promedio:** ≥ 55fps
- **Tamaño total assets:** < 200KB (4 archivos)

---

## 🐛 Troubleshooting

### Assets no se cargan
```tsx
// Verificar ruta en consola
console.log('Intentando cargar:', `/assets/dino/${stage}.json`);

// Verificar que los archivos existan en public/assets/dino/
// NO en src/assets/dino/ (Vite no los servirá)
```

### Animación se ve cortada
```tsx
// Asegurar que el contenedor tenga overflow visible
<div style={{ overflow: 'visible' }}>
  <StudentCharacter3DOptimized ... />
</div>
```

### Lag en dispositivos móviles
```tsx
// Reducir FPS en Lottie (editar JSON)
{
  "fr": 20,  // Frame rate (default 30, reducir a 20)
  ...
}
```

### Fallback siempre visible
```tsx
// Verificar que Lottie esté instalado
npm list lottie-react

// Si no está:
npm install lottie-react
```

---

## 🎯 Checklist de Implementación

### Antes de usar en producción

- [ ] 4 archivos JSON en `public/assets/dino/`
- [ ] Cada archivo < 50KB
- [ ] `lottie-react` instalado
- [ ] Testear en:
  - [ ] Chrome móvil (Android)
  - [ ] Safari móvil (iOS)
  - [ ] Chrome desktop
  - [ ] Firefox
- [ ] Verificar con prefers-reduced-motion activado
- [ ] Comprobar CLS (Layout Shift) = 0
- [ ] Medir FPS en móvil de gama baja

### Optimización avanzada (opcional)

- [ ] Implementar service worker para cache de assets
- [ ] Usar AVIF/WebP como fallback en lugar de JSON (si < 50KB)
- [ ] A/B testing: Lottie vs Sprite sheet (medir engagement)
- [ ] Añadir analytics para tracking de stage changes

---

## 📞 Soporte

**Documentación Lottie:**  
- [Lottie Docs](https://airbnb.io/lottie/)
- [Lottie React](https://github.com/Gamote/lottie-react)

**Optimización:**  
- [Lottie Optimizer](https://lottiefiles.com/tools/lottie-optimizer)
- [Bodymovin Plugin](https://aescripts.com/bodymovin/)

**Debugging:**  
- [Lottie Preview](https://lottiefiles.com/preview) - Vista previa online
- [Lottie Editor](https://lottiefiles.com/editor) - Edición visual

---

## 🔄 Migración desde Componente Antiguo

### Reemplazo directo

```tsx
// ANTES (StudentCharacter3D.tsx)
import StudentCharacter3D from '@/components/student/StudentCharacter3D';

<StudentCharacter3D
  progress={progress}
  size="md"
  showProgressText={true}
/>

// DESPUÉS (StudentCharacter3DOptimized.tsx)
import StudentCharacter3DOptimized from '@/components/student/StudentCharacter3DOptimized';

<StudentCharacter3DOptimized
  progress={progress}
  size="md"
  showProgressText={true}
/>
```

**¡Las props son idénticas! No requiere cambios en el código padre.**

### Testing A/B (opcional)

```tsx
// Comparar ambos componentes lado a lado
const useOptimized = Math.random() > 0.5; // 50% traffic

{useOptimized ? (
  <StudentCharacter3DOptimized {...props} />
) : (
  <StudentCharacter3D {...props} />
)}
```

---

## 📄 Licencia y Créditos

**Componente:** MIT License  
**Lottie:** Apache License 2.0  
**Bodymovin:** MIT License

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026  
**Autor:** Frontend Engineer Senior - Academia Tesla Hub
