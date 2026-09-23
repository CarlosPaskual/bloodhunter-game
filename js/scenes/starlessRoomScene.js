// scenes/starlessRoomScene.js
// Tercera sala sobre BaseRoomScene. Puzle `timing_compare`: 4 espejos (el
// arte final generado incluyó uno más de los 3 previstos), uno de ellos
// (mirror_2) refleja el movimiento del cursor con 400-600ms de retraso. La
// pista es puramente visual (sin texto que lo delate) — el jugador debe
// notar el desfase por sí mismo antes de que el diálogo lo confirme.

import { BaseRoomScene } from "./baseRoomScene.js";
import { gameState } from "../engine/gameState.js";

const DELAY_MS = 500; // dentro del rango 400-600ms fijado en el GDD

const MIRROR_HITBOXES = {
  mirror_1: { x: 115, y: 110, w: 105, h: 150, label: "Espejo" },
  mirror_2: { x: 250, y: 105, w: 80, h: 150, label: "Espejo" },
  mirror_3: { x: 345, y: 125, w: 95, h: 145, label: "Espejo" },
  mirror_4: { x: 455, y: 110, w: 85, h: 155, label: "Espejo" },
};

const DELAYED_MIRROR_ID = "mirror_2";
const NORMAL_MIRROR_SEGMENTS = {
  mirror_1: "mirror_normal_1",
  mirror_3: "mirror_normal_3",
  mirror_4: "mirror_normal_4",
};

export class StarlessRoomScene extends BaseRoomScene {
  constructor(args) {
    super(args);
    this._broken = false;
    this._mouseY = 250; // posición vertical inicial, dentro del rango de los espejos
    // Buffer de {t, y} para poder "mirar atrás en el tiempo" y resolver el
    // reflejo retrasado sin necesitar un sistema de replay completo.
    this._trail = [];
  }

  getHitboxes() {
    if (this._broken) return {};
    return MIRROR_HITBOXES;
  }

  onObjectClick(objectId) {
    if (objectId !== DELAYED_MIRROR_ID) {
      this.playSegment(NORMAL_MIRROR_SEGMENTS[objectId] ?? "mirror_normal_1");
      return;
    }
    const count = gameState.registerInteraction(this.memberId, DELAYED_MIRROR_ID);
    if (count === 1) {
      this.playSegment("mirror_delay_first");
    } else if (count === 2) {
      this.playSegment("mirror_delay_confirm");
    } else {
      this._broken = true;
      this.playSegment("break_mirror");
    }
  }

  onDialogueSegmentEnd(segmentKey) {
    if (segmentKey === "break_mirror") {
      this.completeObjective();
      this.playSegment("closing");
    } else if (segmentKey === "closing") {
      this.exitRoom();
    }
    // "entrance", "mirror_normal_*", "mirror_delay_first/confirm": free-roam.
  }

  onMouseMove(x, y) {
    this._mouseY = y;
    const now = performance.now();
    this._trail.push({ t: now, y });
    // Solo necesitamos ~1s de histórico para cubrir el delay + margen.
    const cutoff = now - 1200;
    while (this._trail.length && this._trail[0].t < cutoff) this._trail.shift();
  }

  _getDelayedY() {
    const targetTime = performance.now() - DELAY_MS;
    // Busca la muestra más antigua que sea >= targetTime (aproximación simple,
    // suficiente para un efecto visual — no necesita interpolación exacta).
    for (const sample of this._trail) {
      if (sample.t >= targetTime) return sample.y;
    }
    return this._trail.length ? this._trail[0].y : this._mouseY;
  }

  renderExtra(ctx, width, height) {
    if (this._broken) return;

    for (const [id, box] of Object.entries(MIRROR_HITBOXES)) {
      ctx.strokeStyle = "#e8e4da";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.setLineDash([]);

      // El "reflejo": un punto que sigue verticalmente al cursor, instantáneo
      // en los espejos normales, retrasado ~500ms en el correcto.
      const sourceY = id === DELAYED_MIRROR_ID ? this._getDelayedY() : this._mouseY;
      const clampedY = Math.max(box.y + 10, Math.min(box.y + box.h - 10, sourceY));
      const reflectionX = box.x + box.w / 2;

      ctx.fillStyle = "#8fa5b8";
      ctx.beginPath();
      ctx.arc(reflectionX, clampedY, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#8fa5b8";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      "Mueve el cursor sobre los espejos y compara cómo responde cada reflejo",
      width / 2,
      height - 145
    );
  }
}
