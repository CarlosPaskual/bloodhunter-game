// scenes/daniRoomScene.js
// Segunda sala construida sobre BaseRoomScene — valida que el patrón escala:
// esta sala añade una capa de sigilo (homenaje paródico a Metal Gear, sin
// assets ni diálogo originales copiados) y un "codec call" que interrumpe el
// guion, sin tocar nada de la clase base ni de las otras salas.
//
// Puzle real: `observation` — 4 estuches de guitarra, uno fuera de orden.
// El sigilo es puramente atmosférico: sin condición de fallo (GDD sección 6).

import { BaseRoomScene } from "./baseRoomScene.js";

const SUSPICION_MAX = 100;
const SUSPICION_RATE_PER_MS = 100 / 6000; // llega al máximo en ~6s si está "expuesto"
const HIDE_COOLDOWN_MS = 4000; // tras esconderse, la sospecha no sube un rato

const CASE_HITBOXES = {
  case_1: { x: 270, y: 230, w: 80, h: 150, label: "Estuche #1" },
  case_2: { x: 370, y: 230, w: 80, h: 150, label: "Estuche #2" },
  case_3: { x: 470, y: 220, w: 70, h: 160, label: "Estuche #3 (forro suelto)" },
  case_4: { x: 560, y: 230, w: 80, h: 150, label: "Estuche #4" },
};

const HIDE_BOX_HITBOX = { x: 655, y: 250, w: 100, h: 130, label: "Flightcase (esconderse)" };

const CORRECT_CASE_ID = "case_3";

export class DaniRoomScene extends BaseRoomScene {
  constructor(args) {
    super(args);
    this._foundCase = false;
    this._suspicion = 0;
    this._hideCooldownRemaining = 0;
  }

  getHitboxes() {
    if (this._foundCase) return {}; // el puzle ya está resuelto, no queda nada que hacer
    return { ...CASE_HITBOXES, hide_box: HIDE_BOX_HITBOX };
  }

  onObjectClick(objectId) {
    if (objectId === "hide_box") {
      this._hideCooldownRemaining = HIDE_COOLDOWN_MS;
      this._suspicion = 0;
      this.playSegment("hide_box_joke");
      return;
    }
    if (objectId === CORRECT_CASE_ID) {
      this._foundCase = true;
      this.playSegment("case_found");
      return;
    }
    // Cualquier otro estuche: en orden, sin nada interesante.
    this.playSegment("case_wrong");
  }

  onDialogueSegmentEnd(segmentKey) {
    if (segmentKey === "case_found") {
      // El codec call se dispara automáticamente al cerrar el guion del hallazgo.
      this.playSegment("codec_call");
    } else if (segmentKey === "codec_call") {
      this.completeObjective();
      this.playSegment("closing");
    } else if (segmentKey === "closing") {
      this.exitRoom();
    }
    // "entrance", "hide_box_joke", "alert_spotted", "case_wrong": el jugador
    // simplemente recupera el control (fase de sigilo/observación libre).
  }

  updateExtra(deltaMs) {
    if (this._foundCase) return;
    if (this.dialogueSystem.isActive) return; // no acumular sospecha durante diálogo

    if (this._hideCooldownRemaining > 0) {
      this._hideCooldownRemaining -= deltaMs;
      return;
    }

    this._suspicion = Math.min(SUSPICION_MAX, this._suspicion + deltaMs * SUSPICION_RATE_PER_MS);
    if (this._suspicion >= SUSPICION_MAX) {
      this._suspicion = 0;
      this._hideCooldownRemaining = HIDE_COOLDOWN_MS; // pequeño respiro tras el susto
      this.playSegment("alert_spotted");
    }
  }

  renderExtra(ctx, width, height) {
    // Hitboxes de los estuches + la caja donde esconderse.
    for (const [id, box] of Object.entries(this.getHitboxes())) {
      const isHideBox = id === "hide_box";
      ctx.strokeStyle = isHideBox ? "#8fa5b8" : "#e8e4da";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.setLineDash([]);
      ctx.fillStyle = isHideBox ? "#8fa5b8" : "#e8e4da";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(box.label, box.x + box.w / 2, box.y - 6);
    }

    if (this._foundCase) return;

    // Indicador de sospecha (homenaje al cono/medidor de detección de MGS).
    const barWidth = 140;
    const barX = width - barWidth - 20;
    const barY = 20;
    ctx.strokeStyle = "#e8e4da";
    ctx.strokeRect(barX, barY, barWidth, 14);
    ctx.fillStyle = this._suspicion > 70 ? "#c0392b" : "#8fa5b8";
    ctx.fillRect(barX, barY, (barWidth * this._suspicion) / SUSPICION_MAX, 14);
    ctx.fillStyle = "#e8e4da";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText("sospecha", barX + barWidth, barY - 4);

    if (this._suspicion > 70) {
      ctx.fillStyle = "#c0392b";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("!", barX + barWidth / 2, barY + 45);
    }
  }
}
