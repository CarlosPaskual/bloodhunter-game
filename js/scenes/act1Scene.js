// scenes/act1Scene.js
// El hallazgo (GDD sección 7 / Guion_Acto1_Hallazgo.md) — hasta ahora solo
// existía como guion escrito, nunca como escena jugable. Estructura: 3 cajas,
// las 2 primeras (señuelos) en cualquier orden, la del libro se habilita solo
// cuando las otras 2 ya se han abierto (refuerza el enfriamiento de tono
// deliberado del guion: humor → gancho emocional → hallazgo real).

import { DialogueSystem } from "../engine/dialogueSystem.js";
import { renderRoom } from "../engine/roomRenderer.js";
import { renderDialogueBox } from "../engine/dialogueBoxRenderer.js";
import { loadImage } from "../engine/imageLoader.js";

const DIALOGUE_PATH = "js/data/dialogue/act1.json";
const BACKGROUND_PATH = "assets/backgrounds/act1_warehouse.png";
const ACCENT_COLOR = "#c9922e"; // ámbar cálido del foco de luz del almacén

const BOX_HITBOXES = {
  box_wig: { x: 100, y: 320, w: 75, h: 60, label: "Caja" },
  box_photo: { x: 365, y: 320, w: 75, h: 60, label: "Caja" },
  box_book: { x: 625, y: 320, w: 75, h: 60, label: "Caja" },
};

export class Act1Scene {
  constructor({ onComplete }) {
    this._onComplete = onComplete;
    this._wigOpened = false;
    this._photoOpened = false;
    this._activeSegment = null;
    this.backgroundImage = null;

    this.dialogueSystem = new DialogueSystem();
    this.dialogueSystem.onScriptEnd = () => this._onSegmentEnd();
  }

  async load() {
    const [dialogueData, background] = await Promise.all([
      fetch(DIALOGUE_PATH).then((res) => res.json()),
      loadImage(BACKGROUND_PATH),
    ]);
    this._dialogueData = dialogueData;
    this.backgroundImage = background;
    this._playSegment("entrance");
  }

  _playSegment(key) {
    this._activeSegment = key;
    this.dialogueSystem.load(this._dialogueData[key]);
  }

  _onSegmentEnd() {
    if (this._activeSegment === "box_wig") this._wigOpened = true;
    if (this._activeSegment === "box_photo") this._photoOpened = true;
    if (this._activeSegment === "box_book") this._onComplete();
    // "entrance": no-op, el jugador pasa a explorar libremente las 3 cajas.
  }

  getHitboxes() {
    const boxes = { box_wig: BOX_HITBOXES.box_wig, box_photo: BOX_HITBOXES.box_photo };
    if (this._wigOpened && this._photoOpened) boxes.box_book = BOX_HITBOXES.box_book;
    return boxes;
  }

  handleClick(x, y) {
    if (this.dialogueSystem.isActive) {
      this.dialogueSystem.advanceOrSkip();
      return;
    }
    for (const [id, box] of Object.entries(this.getHitboxes())) {
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
        this._playSegment(id);
        return;
      }
    }
  }

  update(deltaMs) {
    this.dialogueSystem.update(deltaMs);
  }

  render(ctx, width, height) {
    renderRoom(ctx, {
      width,
      height,
      accentColor: ACCENT_COLOR,
      distortionLevel: 0,
      label: "Almacén",
      backgroundImage: this.backgroundImage,
    });

    for (const [id, box] of Object.entries(this.getHitboxes())) {
      const opened = (id === "box_wig" && this._wigOpened) || (id === "box_photo" && this._photoOpened);
      ctx.strokeStyle = opened ? "#4a4f5d" : "#e8e4da";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.setLineDash([]);
    }

    renderDialogueBox(ctx, { width, height, dialogueSystem: this.dialogueSystem });
  }
}
