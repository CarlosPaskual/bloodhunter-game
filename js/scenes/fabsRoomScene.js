// scenes/fabsRoomScene.js
// Cuarta sala sobre BaseRoomScene. Puzle `audio_compare`: 3 tuberías/paneles,
// cada uno con un zumbido de intensidad/timbre distinto; solo pipe_3 (el
// correcto) suena grave y sostenido, coherente con el guion.
//
// A diferencia de las 3 salas anteriores (pista visual/textual), aquí la
// pista es sonora de verdad — usa HumOscillator (Web Audio API) en vez de un
// indicador en pantalla.

import { BaseRoomScene } from "./baseRoomScene.js";
import { HumOscillator } from "../engine/humOscillator.js";

const PIPE_HITBOXES = {
  pipe_1: { x: 40, y: 90, w: 150, h: 250, label: "Tubería", freq: 320, volume: 0.02 },
  pipe_2: { x: 285, y: 150, w: 130, h: 230, label: "Tubería", freq: 220, volume: 0.05 },
  pipe_3: { x: 545, y: 90, w: 205, h: 270, label: "Tubería", freq: 55, volume: 0.09 },
};

const CORRECT_PIPE_ID = "pipe_3";

export class FabsRoomScene extends BaseRoomScene {
  constructor(args) {
    super(args);
    this._solved = false;
    this._noticedCorrectPipe = false;
    this._hum = new HumOscillator();
    this._hoveredPipeId = null;
  }

  getHitboxes() {
    if (this._solved) return {};
    return PIPE_HITBOXES;
  }

  onMouseMove(x, y) {
    if (this._solved) return;
    const hovered = Object.entries(this.getHitboxes()).find(([, box]) =>
      x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h
    );
    this._hoveredPipeId = hovered ? hovered[0] : null;

    if (this.dialogueSystem.isActive) return; // no tapar el diálogo con el zumbido

    if (this._hoveredPipeId) {
      const box = PIPE_HITBOXES[this._hoveredPipeId];
      this._hum.setTarget(box.freq, box.volume);
    } else {
      this._hum.setTarget(0, 0);
    }
  }

  onObjectClick(objectId) {
    if (objectId !== CORRECT_PIPE_ID) {
      this.playSegment(objectId === "pipe_1" ? "panel_low" : "panel_mid");
      return;
    }
    if (!this._noticedCorrectPipe) {
      this._noticedCorrectPipe = true;
      this.playSegment("panel_high_first");
    } else {
      this._solved = true;
      this._hum.cutAbruptly(); // corte abrupto, no gradual (GDD sección 6)
      this.playSegment("manipulate_valve");
    }
  }

  onDialogueSegmentEnd(segmentKey) {
    if (segmentKey === "manipulate_valve") {
      this.completeObjective();
      this.playSegment("closing");
    } else if (segmentKey === "closing") {
      this.exitRoom();
    }
    // "entrance", "panel_low", "panel_mid", "panel_high_first": free-roam.
  }

  renderExtra(ctx, width, height) {
    for (const [id, box] of Object.entries(this.getHitboxes())) {
      const isHovered = id === this._hoveredPipeId;
      ctx.strokeStyle = isHovered ? "#2d4a35" : "#e8e4da";
      ctx.lineWidth = isHovered ? 3 : 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.fillStyle = "#e8e4da";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(box.label, box.x + box.w / 2, box.y - 6);
    }

    if (!this._solved) {
      ctx.fillStyle = "#8fa5b8";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        "Acerca el cursor a cada tubería y compara el sonido",
        width / 2,
        height - 145
      );
    }
  }

  destroy() {
    this._hum.stop();
  }
}
