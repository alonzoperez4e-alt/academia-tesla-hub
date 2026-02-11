# 🦖 Dinosaurio Optimizado - Guía de Instalación Rápida

## ⚡ Instalación en 3 pasos

### 1️⃣ Instalar dependencia Lottie

```bash
npm install lottie-react
```

**O con Bun (recomendado para este proyecto):**

```bash
bun add lottie-react
```

### 2️⃣ Reemplazar assets (cuando estén listos)

Los archivos placeholder en `public/assets/dino/` son animaciones básicas de ejemplo.

**Reemplázalos con tus animaciones finales:**

- `public/assets/dino/egg.json` → Tu animación del huevo exportada desde After Effects
- `public/assets/dino/cracking.json` → Tu animación del huevo agrietándose
- `public/assets/dino/hatching.json` → Tu animación del dinosaurio naciendo
- `public/assets/dino/grown.json` → Tu animación del dinosaurio completamente crecido

**Especificaciones técnicas:** Ver [DINOSAUR_OPTIMIZATION_GUIDE.md](./DINOSAUR_OPTIMIZATION_GUIDE.md)

### 3️⃣ Usar el componente

**Opción A: Reemplazo directo (recomendado)**

```tsx
// En src/pages/StudentDashboard.tsx (o donde uses el dinosaurio)

// ANTES:
// import StudentCharacter3D from "@/components/student/StudentCharacter3D";

// DESPUÉS:
import StudentCharacter3D from "@/components/student/StudentCharacter3DOptimized";

// El resto del código queda igual, las props son idénticas
<StudentCharacter3D
  progress={userProgress}
  size="md"
  showProgressText={true}
/>
```

**Opción B: Testing A/B (comparar rendimiento)**

```tsx
import StudentCharacter3D from "@/components/student/StudentCharacter3D";
import StudentCharacter3DOptimized from "@/components/student/StudentCharacter3DOptimized";

// Alternar entre componentes para comparar
const USE_OPTIMIZED = true; // Cambiar a false para ver el antiguo

{USE_OPTIMIZED ? (
  <StudentCharacter3DOptimized progress={progress} size="md" />
) : (
  <StudentCharacter3D progress={progress} size="md" />
)}
```

---

## ✅ Verificación

### Comprobar que funciona:

1. **Iniciar dev server:**
   ```bash
   bun run dev
   ```

2. **Abrir navegador** → Dashboard de estudiante

3. **Verificar:**
   - ✅ Animación del dinosaurio se carga
   - ✅ Cambia de etapa al modificar el progreso
   - ✅ No hay errores en consola
   - ✅ La animación es fluida (60fps)

### Si ves fallback (huevo estático):

Esto es **normal** si:
- Los assets JSON aún no están creados (usa placeholders por ahora)
- Hay un error en la ruta de los archivos
- Lottie-react no está instalado

**Solución:**
```bash
# Verificar instalación
npm list lottie-react

# Si no está instalado:
bun add lottie-react
```

---

## 🎨 Próximos pasos (para diseñador)

### Crear animaciones finales en After Effects

1. **Descargar plugin Bodymovin:**
   - [https://aescripts.com/bodymovin/](https://aescripts.com/bodymovin/)

2. **Crear cada etapa:**
   - Dimensiones: 300x360px @ 24fps
   - Duración: 3-6 segundos (loop)
   - Peso objetivo: < 50KB por archivo

3. **Exportar con Bodymovin:**
   - Window → Extensions → Bodymovin
   - Seleccionar comp → Render
   - Configuración: Ver [DINOSAUR_OPTIMIZATION_GUIDE.md](./DINOSAUR_OPTIMIZATION_GUIDE.md#-proceso-de-exportación-after-effects--lottie)

4. **Optimizar (opcional):**
   ```bash
   npm install -g @lottiefiles/lottie-optimizer
   lottie-optimize egg.json egg-optimized.json
   ```

5. **Reemplazar archivos:**
   - Copiar `.json` optimizados a `public/assets/dino/`
   - Recargar aplicación
   - ¡Listo! 🎉

---

## 📊 Características Implementadas

### ✅ Optimizaciones de rendimiento
- [x] Lazy loading con IntersectionObserver
- [x] Code splitting de Lottie (carga bajo demanda)
- [x] Pre-caching inteligente (etapa actual + siguiente)
- [x] Solo animaciones GPU-accelerated (transform/opacity)
- [x] Prevención de Layout Shift (CLS = 0)
- [x] Fallback visual si falla la carga

### ✅ Accesibilidad
- [x] Respeta `prefers-reduced-motion`
- [x] Mensajes descriptivos para lectores de pantalla
- [x] Alternativa visual (fallback CSS)

### ✅ Compatibilidad
- [x] Todas las props del componente original
- [x] Drop-in replacement (no rompe código existente)
- [x] Funciona en iOS, Android, Desktop
- [x] Navegadores soportados: Chrome, Firefox, Safari, Edge

---

## 🐛 Troubleshooting

### Problema: "Module not found: lottie-react"
```bash
bun add lottie-react
```

### Problema: "Failed to load /assets/dino/egg.json"
- Verificar que los archivos existan en `public/assets/dino/`
- NO en `src/assets/dino/` (debe ser en `public/`)
- Reiniciar dev server

### Problema: Animación se ve cortada
```tsx
// Asegurar overflow visible en el contenedor padre
<div className="overflow-visible">
  <StudentCharacter3DOptimized ... />
</div>
```

### Problema: Lag en móviles
- Reducir FPS en los JSON a 20fps (editar campo `"fr": 20`)
- Simplificar paths en After Effects antes de exportar
- Verificar que cada JSON pese < 50KB

---

## 📚 Documentación Completa

Ver [DINOSAUR_OPTIMIZATION_GUIDE.md](./DINOSAUR_OPTIMIZATION_GUIDE.md) para:
- Especificaciones técnicas detalladas
- Proceso completo de exportación desde After Effects
- Optimizaciones avanzadas
- Benchmarks de rendimiento
- API del componente

---

## 🎯 Estado Actual

| Componente | Estado | Peso | Notas |
|------------|--------|------|-------|
| `StudentCharacter3DOptimized.tsx` | ✅ Completo | ~8KB | Código listo |
| `use-intersection-observer.ts` | ✅ Completo | ~1KB | Hook reutilizable |
| `egg.json` | ⚠️ Placeholder | 2KB | Reemplazar con asset final |
| `cracking.json` | ⚠️ Placeholder | 3KB | Reemplazar con asset final |
| `hatching.json` | ⚠️ Placeholder | 3KB | Reemplazar con asset final |
| `grown.json` | ⚠️ Placeholder | 4KB | Reemplazar con asset final |

**Total actual:** ~21KB (assets placeholders)  
**Total esperado:** ~150-200KB (con assets finales de alta calidad)

---

## 📞 Soporte

**Preguntas técnicas:** Ver documentación completa  
**Problemas de instalación:** Verificar troubleshooting  
**Diseño de animaciones:** Contactar al equipo de diseño

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026  
