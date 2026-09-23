// engine/gameState.js
// Fuente única de verdad del progreso del jugador.
// Implementa el sistema de tensión global definido en el GDD (sección 5):
// el progreso de CUALQUIER sala afecta a la distorsión de TODAS las salas.

import { eventBus } from "./eventBus.js";

const ALL_MEMBERS = ["diva", "dani", "starless", "fabs", "adrian"];

export const gameState = {
  objectivesCompleted: new Set(),
  // Interacciones por-objeto que necesitan persistir sí o sí entre visitas a la
  // sala (ej. el cuaderno de Diva: "no decía otra, decía otro" solo funciona si
  // el contador sobrevive a que el jugador salga y vuelva a entrar).
  interactionCounts: new Map(), // key: `${memberId}:${objectId}` -> number

  get globalTension() {
    return this.objectivesCompleted.size; // 0-5
  },

  isObjectiveDone(memberId) {
    return this.objectivesCompleted.has(memberId);
  },

  completeObjective(memberId) {
    if (this.objectivesCompleted.has(memberId)) return; // evita re-disparar eventos
    this.objectivesCompleted.add(memberId);

    eventBus.emit("objectiveCompleted", { memberId, total: this.objectivesCompleted.size });

    if (this.objectivesCompleted.size === ALL_MEMBERS.length) {
      eventBus.emit("finalRoomUnlocked");
    }
  },

  getInteractionCount(memberId, objectId) {
    return this.interactionCounts.get(`${memberId}:${objectId}`) ?? 0;
  },

  registerInteraction(memberId, objectId) {
    const key = `${memberId}:${objectId}`;
    const next = (this.interactionCounts.get(key) ?? 0) + 1;
    this.interactionCounts.set(key, next);
    return next;
  },

  // distortionLevel de una sala: 0-3.
  // ownObjectiveDone: la propia sala se distorsiona más al resolverse su objetivo.
  // ambientTension: el progreso de las OTRAS salas se "filtra" aquí también,
  // aunque el jugador nunca haya puesto un pie en esta sala.
  getDistortionLevel(memberId) {
    const ownObjectiveDone = this.isObjectiveDone(memberId) ? 1 : 0;
    const ambientTension = Math.floor(this.globalTension / 2);
    return Math.min(3, ownObjectiveDone + ambientTension);
  },
};
