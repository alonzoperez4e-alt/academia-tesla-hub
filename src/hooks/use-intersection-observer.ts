import { useEffect, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Hook personalizado para IntersectionObserver
 * Optimizado para lazy-loading de assets pesados
 * 
 * @param elementRef - Ref del elemento a observar
 * @param callback - Función a ejecutar cuando cambia la visibilidad
 * @param options - Opciones de IntersectionObserver
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  callback: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void,
  options: UseIntersectionObserverOptions = {}
): void {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback para navegadores antiguos: asumir que es visible
      callback(true, {} as IntersectionObserverEntry);
      return;
    }

    let hasBeenVisible = false;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      const isIntersecting = entry.isIntersecting;

      // Si freezeOnceVisible está activado y ya fue visible una vez, no hacer nada más
      if (freezeOnceVisible && hasBeenVisible) {
        return;
      }

      if (isIntersecting) {
        hasBeenVisible = true;
      }

      callback(isIntersecting, entry);
    };

    const observerOptions: IntersectionObserverInit = {
      threshold,
      root,
      rootMargin
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observer.observe(element);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [elementRef, callback, threshold, root, rootMargin, freezeOnceVisible]);
}
