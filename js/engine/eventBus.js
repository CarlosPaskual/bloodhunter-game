// engine/eventBus.js
// Comunicación desacoplada entre sistemas (objetivos, sonido, desbloqueos, UI).
// Regla de arquitectura del GDD: nunca comprobar condiciones por polling en el
// game loop — todo cambio de estado relevante se anuncia como evento.

export class EventBus {
  constructor() {
    this._listeners = new Map(); // eventName -> Set<callback>
  }

  on(eventName, callback) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName).add(callback);
    // Devuelve una función de "unsubscribe" para limpiar listeners al cambiar de escena.
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    this._listeners.get(eventName)?.delete(callback);
  }

  emit(eventName, payload) {
    const callbacks = this._listeners.get(eventName);
    if (!callbacks) return;
    // Copia defensiva: si un callback se desuscribe a sí mismo durante el emit,
    // no queremos romper la iteración.
    [...callbacks].forEach((cb) => cb(payload));
  }
}

// Instancia única compartida por todo el juego.
export const eventBus = new EventBus();
