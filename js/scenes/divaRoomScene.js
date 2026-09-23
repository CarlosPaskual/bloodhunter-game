// scenes/divaRoomScene.js
// Sala de Diva reimplementada sobre BaseRoomScene (ver esa clase para lo
// compartido). Aquí solo queda lo que hace a esta sala distinta: el cuaderno
// con relectura (puzzleType "reread") y el Action Beat "hold_release".

import { BaseRoomScene } from "./baseRoomScene.js";
import { gameState } from "../engine/gameState.js";

const OBJECT_HITBOXES = {
  notebook: { x: 210, y: 225, w: 110, h: 75, label: "Cuaderno" },
  microphone: { x: 450, y: 135, w: 75, h: 145, label: "Micrófono" },
};

export class DivaRoomScene extends BaseRoomScene {
  constructor(args) {
    super(args);
    this._micUnlocked = false;
    this._holding = false;
  }

  getHitboxes() {
    const boxes = { notebook: OBJECT_HITBOXES.notebook };
    if (this._micUnlocked) boxes.microphone = OBJECT_HITBOXES.microphone;
    return boxes;
  }

  /** Sobrescribe la posición por defecto (tercio izquierdo) porque en este
   *  fondo el cuaderno ocupa justo esa zona — Diva se coloca junto al
   *  micrófono en su lugar, coherente además con que es la cantante. */
  _drawCharacterSprite(ctx, width, height) {
    const targetHeight = height * 0.62;
    const targetWidth = this.characterSprite.width * (targetHeight / this.characterSprite.height);
    const x = width * 0.62;
    const y = height - targetHeight - 15;
    ctx.drawImage(this.characterSprite, x, y, targetWidth, targetHeight);
  }

  onObjectClick(objectId) {
    if (objectId === "notebook") {
      const count = gameState.registerInteraction(this.memberId, "notebook");
      this.playSegment(count === 1 ? "notebook_first_read" : "notebook_second_read");
      if (count >= 2) this._micUnlocked = true;
    } else if (objectId === "microphone") {
      this.playSegment("action_read_aloud");
    }
  }

  onDialogueSegmentEnd(segmentKey) {
    if (segmentKey === "action_read_aloud") {
      this.completeObjective();
      this.playSegment("closing");
    } else if (segmentKey === "closing") {
      this.exitRoom();
    }
  }

  onActionBeatStarted() {
    this._holding = false;
  }

  onMouseDown() {
    this._holding = true;
  }

  onMouseUp() {
    this._holding = false;
  }

  renderExtra(ctx, width, height) {
    for (const [id, box] of Object.entries(this.getHitboxes())) {
      this._drawHitbox(ctx, box, true);
    }
    if (this._pendingActionBeatDone) {
      ctx.fillStyle = "#e8e4da";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        this._holding ? "Manteniendo... suelta cuando quieras" : "Mantén pulsado para sostener la nota",
        width / 2,
        height - 150
      );
    }
  }

  _drawHitbox(ctx, box, enabled) {
    ctx.strokeStyle = enabled ? "#e8e4da" : "#4a4f5d";
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.setLineDash([]);
    ctx.fillStyle = enabled ? "#e8e4da" : "#4a4f5d";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(box.label, box.x + box.w / 2, box.y - 6);
  }
}
