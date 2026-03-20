// SockJS expects a Node-like `global`. In browsers ensure it points to globalThis.
if (typeof globalThis !== 'undefined' && !(globalThis as any).global) {
  (globalThis as any).global = globalThis;
}
